import 'ol/ol.css'
import 'Source/css/view.css'
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
    styleFunction,
    wmsGetFeatureInfoFormats
} from 'Source/containers/staticMethods'

import BasicViewer from 'Source/components/view/BasicViewer'
import Collection from 'ol/collection'
import FileSaver from 'file-saver'
import Group from 'ol/layer/group'
import MapConfigService from 'Source/services/MapConfigService'
import MapConfigTransformService from 'Source/services/MapConfigTransformService'
import Overlay from 'ol/overlay'
import PropTypes from 'prop-types'
import URLS from 'Source/containers/URLS'
import { arrayMove } from 'react-sortable-hoc'
import proj4 from 'proj4'
import { render } from 'react-dom'

class BasicViewerContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mapIsLoading: false,
            drawerOpen: false,
            featureIdentifyLoading: false,
            activeFeature: 0,
            mouseCoordinates: [0, 0],
            featureIdentifyResult: [],
            showPopup: false,
            legends: [],
            featureCollection: new Collection(),
            map: getMap(),
            mapLayers: []
        }
        this.urls = new URLS(this.props.urls)
    }
    exportMap = () => {
        let { map } = this.state
        map.once('postcompose', (event) => {
            let canvas = event.context.canvas
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(canvas.msToBlob(), 'map.png')
            } else {
                canvas.toBlob((blob) => {
                    FileSaver.saveAs(blob, 'map.png')
                })
            }
        })
        map.renderSync()
    }
    getLegendURL = (layerName) => {
        const { urls } = this.props
        const url = this.urls.getParamterizedURL(urls.wmsURL, {
            'REQUEST': 'GetLegendGraphic',
            'VERSION': '1.0.0',
            'FORMAT': 'image/png',
            "LAYER": layerName
        })
        return this.urls.getProxiedURL(url)
    }
    toggleDrawer = () => {
        const { drawerOpen } = this.state
        this.setState({ drawerOpen: !drawerOpen })
    }
    addOverlay = (node) => {
        const { activeFeature, featureIdentifyResult, mouseCoordinates } =
            this.state
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
    mapInit = () => {
        const { urls } = this.props
        let { map } = this.state
        fetch(urls.mapJsonUrl, {
            method: "GET",
            credentials: 'include'
        }).then((response) => {
            return response.json()
        }).then((config) => {
            MapConfigService.load(MapConfigTransformService.transform(
                config), map, urls.proxy)
            const mapLayers = map.getLayers().getArray()
            this.setLayerSwitcherLayers(mapLayers)
            this.createLegends(getLayers(mapLayers))
        })
    }
    componentWillMount() {
        let { map, featureCollection } = this.state
        this.setState({ mapIsLoading: true })
        this.overlay = new Overlay({
            autoPan: true,
        })
        map.addOverlay(this.overlay)
        addSelectionLayer(map, featureCollection, styleFunction)
        this.mapInit()
    }
    componentDidMount() {
        this.singleClickListner()
    }
    setLayerSwitcherLayers(mapLayers) {
        let layers = []
        mapLayers.map(layer => {
            if (!(layer instanceof Group)) {
                layers.push(layer)
            }
        })
        this.setState({ mapLayers: layers.slice(0).reverse() })
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
        let { map } = this.state
        this.addStyleToFeature([feature])
        const featureCenter = feature.getGeometry().getExtent()
        const center = getCenterOfExtent(featureCenter)
        flyTo(center, map.getView(), 14, () => { })
    }
    handleLayerVisibilty = name => (event, checked) => {
        let { mapLayers } = this.state
        let layer = mapLayers[name]
        layer.setVisible(checked)
        this.setState({ mapLayers })
    }
    changeLayerOrder = ({ oldIndex, newIndex }) => {
        const { mapLayers } = this.state
        const newMapLayers = arrayMove(mapLayers, oldIndex, newIndex)
        newMapLayers.map((layer, index) => {
            layer.setZIndex(mapLayers.length - index)
        })
        this.setState({ mapLayers: newMapLayers })
    }
    singleClickListner = () => {
        let { map } = this.state
        map.on('singleclick', (e) => {
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
            this.featureIdentify(map, e.coordinate)
        })
    }
    createLegends = (layers) => {
        let legends = []
        layers.map(layer => {
            const layerName = layer.getProperties().name
            legends.push({
                layer: layerName, url: this.getLegendURL(
                    layerName)
            })
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
        let { featureCollection } = this.state
        featureCollection.clear()
    }
    addStyleToFeature = (features) => {
        let { featureCollection } = this.state
        this.resetFeatureCollection()
        if (features && features.length > 0) {
            featureCollection.extend(features)
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
                            result.crs.properties.name.split(":").pop() : null
                        this.getCRS(crs).then((newCRS) => {
                            const transformedFeatures = this.transformFeatures(
                                layer, features,
                                map, newCRS)
                            resolve(transformedFeatures)
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
            addOverlay: this.addOverlay,
            changeShowPopup: this.changeShowPopup,
            nextFeature: this.nextFeature,
            previousFeature: this.previousFeature,
            changeLayerOrder: this.changeLayerOrder,
            handleLayerVisibilty: this.handleLayerVisibilty,
            exportMap: this.exportMap
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
