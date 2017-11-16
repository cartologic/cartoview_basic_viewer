import 'openlayers/dist/ol.css'
import '../css/view.css'
import 'typeface-roboto'

import React, { Component } from 'react'
import {
    addSelectionLayer,
    flyTo,
    getCenterOfExtent,
    getFeatureInfoUrl,
    getLayers,
    getMap,
    layerName,
    layerNameSpace,
    wmsGetFeatureInfoFormats
} from './staticMethods'

import BasicViewer from '../components/view/BasicViewer'
import MapConfigService from '@boundlessgeo/sdk/services/MapConfigService'
import MapConfigTransformService from '@boundlessgeo/sdk/services/MapConfigTransformService'
import PropTypes from 'prop-types'
import URLS from './URLS'
import ol from 'openlayers'
import { render } from 'react-dom'
import { styleFunction } from './styling.jsx'

class BasicViewerContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mapIsLoading: false,
            drawerOpen: true,
            featureIdentifyLoading: false,
            activeFeatures: 0,
            featureIdentifyResult: [],
            showPopup: false
        }
        this.urls = new URLS(this.props.urls)
        this.map = getMap()
        this.featureCollection = new ol.Collection()
        addSelectionLayer(this.map, this.featureCollection, styleFunction)
    }
    toggleDrawer = () => {
        const { drawerOpen } = this.state
        this.setState({ drawerOpen: !drawerOpen })
    }
    componentWillMount() {
        const { urls } = this.props
        this.loadMap(urls.mapJsonUrl, urls.proxy)
    }
    componentDidMount() {
        this.singleClickListner()
    }
    loadMap = (mapUrl, proxyURL) => {
        this.setState({ mapIsLoading: true })
        fetch(mapUrl, {
            method: "GET",
            credentials: 'include'
        }).then((response) => {
            return response.json()
        }).then((config) => {
            if (config) {
                MapConfigService.load(MapConfigTransformService.transform(
                    config), this.map, proxyURL)
                this.setState({ mapIsLoading: false })
            }
        }).catch((error) => {
            throw Error(error)
        })
    }
    getCRS = (crs) => {
        let promise = new Promise((resolve, reject) => {
            if (proj4.defs('EPSG:' + crs)) {
                resolve(crs)
            } else {
                fetch("https://epsg.io/?format=json&q=" + crs).then(
                    response => response.json()).then(
                    projres => {
                        proj4.defs('EPSG:' + crs, projres.results[
                            0].proj4)
                        resolve(crs)
                    })
            }
        })
        return promise
    }
    zoomToFeature = (feature) => {
        const featureCenter = feature.getGeometry().getExtent()
        const center = getCenterOfExtent(featureCenter)
        flyTo(center, this.map.getView(), 14, () => { })
    }
    singleClickListner = () => {
        this.map.on('singleclick', (e) => {
            this.setState({
                featureIdentifyLoading: true,
                activeFeatures: 0,
                featureIdentifyResult: [],
                showPopup: false
            })
            document.body.style.cursor = "progress"
            this.featureIdentify(this.map, e.coordinate)
        })
    }
    transformFeatures = (layer, features, map, crs) => {
        let transformedFeatures = []
        features.forEach((feature) => {
            feature.getGeometry().transform('EPSG:' + crs, map.getView()
                .getProjection())
            feature.set("_layerTitle", layer.get('title'))
            transformedFeatures.push(feature)
        })
        return transformedFeatures
    }
    addStyleToFeature = (features) => {
        this.featureCollection.clear()
        if (features && features.length > 0) {
            this.featureCollection.extend(features)
        }
    }
    getFeatureByURL = (url) => {
        return fetch(this.urls.getProxiedURL(url)).then((response) =>
            response.json())
    }
    featureIdentify = (map, coordinate) => {
        const view = map.getView()
        let identifyPromises = getLayers(map.getLayers().getArray()).map(
            (layer) => {
                const url = getFeatureInfoUrl(layer, coordinate, view,
                    'application/json')
                return this.getFeatureByURL(url).then(
                    (result) => {
                        var promise = new Promise((resolve, reject) => {
                            const features = wmsGetFeatureInfoFormats[
                                'application/json'].readFeatures(result)
                            if (features.length > 0) {
                                const crs = result.features.length > 0 ? result.crs
                                    .properties.name.split(":").pop() : null
                                this.getCRS(crs).then((newCRS) => {
                                    const transformedFeatures = this.transformFeatures(layer,
                                        features, map, newCRS)
                                    resolve(transformedFeatures)
                                }, (error) => {
                                    reject(error)
                                })
                            }else{
                                resolve([])
                            }
                        })
                        return promise
                    })
            })
        Promise.all(identifyPromises).then(result => {
            const featureIdentifyResult = result.reduce((array1, array2) => array1.concat(array2), [])
            this.setState({
                featureIdentifyLoading: false,
                featureIdentifyResult,
                activeFeatures: 0,
                showPopup: true
            }, () => this.addStyleToFeature(featureIdentifyResult))
            console.log(featureIdentifyResult)
            document.body.style.cursor = "default"
        })
    }
    render() {
        const { config, urls } = this.props
        let childrenProps = {
            config,
            ...this.state,
            zoomToFeature: this.zoomToFeature,
            addStyleToFeature: this.addStyleToFeature,
            layerName,
            layerNameSpace,
            urls,
            map: this.map
        }
        return <BasicViewer childrenProps={childrenProps} />
    }
}
BasicViewerContainer.propTypes = {
    urls: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired
}
global.BasicViewerContainer = {
    show: (el, props, urls) => {
        render(<BasicViewerContainer urls={urls} config={props} />,
            document.getElementById(el))
    }
}
