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
            activeFeature: 0,
            mouseCoordinates: [0, 0],
            featureIdentifyResult: [],
            showPopup: false,
            legends: []
        }
        this.urls = new URLS(this.props.urls)
        this.map = getMap()
        this.featureCollection = new ol.Collection()
        this.overlay = new ol.Overlay({
            autoPan: true,
        })
        addSelectionLayer(this.map, this.featureCollection, styleFunction)
        this.map.addOverlay(this.overlay)
    }
    getLegendURL = (layerName) => {
        const { urls } = this.props
        const url = this.urls.getParamterizedURL(urls.wmsURL, {
            'REQUEST': 'GetLegendGraphic', 'VERSION': '1.0.0',
            'FORMAT': 'image/png',
            "LAYER": layerName
        })
        return url
    }
    toggleDrawer = () => {
        const { drawerOpen } = this.state
        this.setState({ drawerOpen: !drawerOpen })
    }
    addOverlay = (node) => {
        const { activeFeature, featureIdentifyResult, mouseCoordinates } = this.state
        let position = mouseCoordinates
        if (featureIdentifyResult.length > 0) {
            const currentFeature = featureIdentifyResult[activeFeature]
            const featureExtent = currentFeature.getGeometry().getExtent()
            position = getCenterOfExtent(featureExtent)
        }
        this.overlay.setElement(node)
        this.overlay.setPosition(position)
    }
    changeShowPopup = () => {
        const { showPopup } = this.state
        this.setState({ showPopup: !showPopup })
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
                this.createLegends(getLayers(this.map.getLayers().getArray()))
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
            if (this.overlay) {
                this.overlay.setElement(undefined)
            }
            this.setState({
                mouseCoordinates: e.coordinate,
                featureIdentifyLoading: true,
                activeFeature: 0,
                featureIdentifyResult: [],
                showPopup: false
            })
            this.featureIdentify(this.map, e.coordinate)
        })
    }
    createLegends = (layers) => {
        let legends = []
        layers.map(layer => {
            const layerName = layer.getProperties().name
            legends.push({layer:layerName,url:this.getLegendURL(layerName)})
        })
        this.setState({ legends })
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
    resetFeatureCollection = () => {
        this.featureCollection.clear()
    }
    addStyleToFeature = (features) => {
        this.resetFeatureCollection()
        if (features && features.length > 0) {
            this.featureCollection.extend(features)
        }
    }
    getFeatureByURL = (url) => {
        return fetch(this.urls.getProxiedURL(url)).then((response) =>
            response.json())
    }
    readFeaturesThenTransform = (layer, coordinate, view, map) => {
        const url = getFeatureInfoUrl(layer, coordinate, view,
            'application/json')
        return this.getFeatureByURL(url).then(
            (result) => {
                var promise = new Promise((resolve, reject) => {
                    const features = wmsGetFeatureInfoFormats[
                        'application/json'].readFeatures(
                        result)
                    if (features.length > 0) {
                        const crs = result.features.length > 0 ?
                            result.crs.properties.name.split(
                                ":").pop() : null
                        this.getCRS(crs).then((newCRS) => {
                            const transformedFeatures =
                                this.transformFeatures(
                                    layer, features,
                                    map, newCRS)
                            resolve(
                                transformedFeatures
                            )
                        }, (error) => {
                            reject(error)
                        })
                    } else {
                        resolve([])
                    }
                })
                return promise
            })
    }
    featureIdentify = (map, coordinate) => {
        const view = map.getView()
        let identifyPromises = getLayers(map.getLayers().getArray()).map(
            (layer) => this.readFeaturesThenTransform(layer,
                coordinate, view, map))
        Promise.all(identifyPromises).then(result => {
            const featureIdentifyResult = result.reduce((array1,
                array2) => array1.concat(array2), [])
            this.setState({
                featureIdentifyLoading: false,
                featureIdentifyResult,
                activeFeature: 0,
                showPopup: true
            }, () => this.addStyleToFeature(
                featureIdentifyResult))
        })
    }
    addStyleToCurrentFeature = () => {
        const { activeFeature, featureIdentifyResult } = this.state
        this.addStyleToFeature([featureIdentifyResult[activeFeature]])
    }
    nextFeature = () => {
        const { activeFeature } = this.state
        const nextIndex = activeFeature + 1
        this.setState({ activeFeature: nextIndex }, this.addStyleToCurrentFeature)
    }
    previousFeature = () => {
        const { activeFeature } = this.state
        const previuosIndex = activeFeature - 1
        this.setState({ activeFeature: previuosIndex }, this.addStyleToCurrentFeature)
    }
    render() {
        const { config, urls } = this.props
        let childrenProps = {
            config,
            ...this.state,
            zoomToFeature: this.zoomToFeature,
            addStyleToFeature: this.addStyleToFeature,
            resetFeatureCollection: this.resetFeatureCollection,
            layerName,
            layerNameSpace,
            toggleDrawer: this.toggleDrawer,
            urls,
            map: this.map,
            addOverlay: this.addOverlay,
            changeShowPopup: this.changeShowPopup,
            nextFeature: this.nextFeature,
            previousFeature: this.previousFeature
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
