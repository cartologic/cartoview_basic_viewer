import 'ol/ol.css'
import 'Source/css/view.css'
import 'typeface-roboto'

import FeaturesHelper, { wmsGetFeatureInfoFormats } from 'Source/helpers/FeaturesHelper'
import React, { Component } from 'react'

import Animation from 'Source/helpers/AnimationHelper'
import BasicViewer from 'Source/components/view/BasicViewer'
import BasicViewerHelper from 'Source/helpers/BasicViewerHelper'
import Collection from 'ol/collection'
import GeoCoding from 'Source/services/GeoCodingService'
import GeoJSON from 'ol/format/geojson'
import Group from 'ol/layer/group'
import LayersHelper from 'Source/helpers/LayersHelper'
import MapConfigService from 'Source/services/MapConfigService'
import MapConfigTransformService from 'Source/services/MapConfigTransformService'
import Overlay from 'ol/overlay'
import PropTypes from 'prop-types'
import URLS from 'Source/utils/URLS'
import Vector from 'ol/layer/vector'
import { default as VectorSource } from 'ol/source/vector'
import _ from "lodash"
import { arrayMove } from 'react-sortable-hoc'
import { doGet } from 'Source/utils/utils'
import proj from 'ol/proj'
import proj4 from 'proj4'
import { render } from 'react-dom'
import { styleFunction } from 'Source/helpers/StyleHelper'

proj.setProj4(proj4)
class BasicViewerContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mapIsLoading: true,
            drawerOpen: false,
            featureIdentifyLoading: false,
            activeFeature: 0,
            mouseCoordinates: [0, 0],
            featureIdentifyResult: [],
            showPopup: false,
            identifyEnabled: true,
            legends: [],
            geocodeSearchLoading: false,
            featureCollection: new Collection(),
            map: BasicViewerHelper.getMap(),
            mapLayers: [],
            features: [],
            featuresIsLoading: false,
            featuresTableOpen: false,
            tableColumns: [],
            tableLayer: '',
            tablePages: null,
        }
        this.urls = new URLS(this.props.urls)
    }
    handleFeaturesTableDrawer = () => {
        const { featuresTableOpen } = this.state
        this.setState({ featuresTableOpen: !featuresTableOpen })
    }
    capitalize = (s) => {
        return s && s[0].toUpperCase() + s.slice(1)
    }
    getData = (features) => {
        let data = []
        features.map(feature => {
            const featureProperties = feature.getProperties()
            let featureObject = {}
            Object.keys(featureProperties).forEach(key => {
                if (key.toLowerCase() !== 'geometry') {
                    featureObject[key] = featureProperties[key]
                }
            })
            featureObject.featureId = feature.getId()
            data.push(featureObject)
        })
        return data
    }
    getColumns = () => {
        const { tableLayer, map } = this.state
        this.getFeatures(tableLayer, 0, 1).then((data) => {
            let features = wmsGetFeatureInfoFormats[
                'application/json'].readFeatures(data, {
                    featureProjection: map.getView().getProjection()
                })
            let columns = [{
                Header: "FeatureID",
                accessor: "featureId"
            }]
            if (features.length > 0) {
                const featureProperties = features[0].getProperties()
                Object.keys(featureProperties).forEach(key => {
                    if (key.toLowerCase() !== 'geometry') {
                        columns.push({
                            id: key,
                            Header: this.capitalize(key),
                            accessor: key
                        })
                    }
                })
            }
            this.setState({ tableColumns: columns })
        })

    }
    getFeatures = (typeNames, startIndex, pagination = null, sortBy = null) => {
        const { map } = this.state
        const { urls } = this.props
        let query = {
            service: 'wfs',
            version: '2.0.0',
            request: 'GetFeature',
            typeNames,
            outputFormat: 'json',
            srsName: map.getView().getProjection().getCode()
        }
        if (pagination) {
            query.count = pagination
        }
        if (startIndex) {
            query.startIndex = startIndex
        }
        if (sortBy) {
            query.sortBy = sortBy
        }
        const requestUrl = this.urls.getParamterizedURL(urls.wfsURL, query)
        const proxiedURL = this.urls.getProxiedURL(requestUrl)
        return doGet(proxiedURL)

    }
    handleTableLayerChange = event => {
        const layer = event.target.value
        if (layer !== this.state.tableLayer) {
            this.setState({ tableLayer: event.target.value, features: [] }, () => {
                this.getTableData({ pageSize: 10, sorted: [], page: 0, filtered: [] }, {})
                this.getColumns()
            })
        }

    }
    getTableData = (state, instance) => {
        this.setState({ featuresIsLoading: true })
        const { map, tableLayer } = this.state
        const pagination = state.pageSize
        const sorted = state.sorted
        const page = state.page
        const filtered = state.filtered
        let sortAtrr = null
        let startIndex = page
        let count = (page + 1) * pagination
        let featuresPromise = this.getFeatures(tableLayer)
        if (sorted.length > 0 && sorted[0].id !== 'featureId') {
            sortAtrr = sorted[0].id
            sortAtrr += sorted[0].desc ? "+D" : "+A"
        }
        featuresPromise = this.getFeatures(tableLayer, startIndex, count, sortAtrr)
        featuresPromise.then(data => {
            const total = data.totalFeatures
            let features = wmsGetFeatureInfoFormats['application/json'].readFeatures(data, {
                featureProjection: map.getView().getProjection()
            })
            features = this.getData(features)
            if (sorted.length > 0 && sorted[0].id !== 'featureId') {
                features = _.orderBy(
                    features,
                    sorted.map(sort => {
                        return row => {
                            if (row[sort.id] === null || row[sort.id] === undefined) {
                                return -Infinity
                            }
                            return typeof row[sort.id] === "string"
                                ? row[sort.id].toLowerCase()
                                : row[sort.id]
                        }
                    }),
                    sorted.map(d => (d.desc ? "desc" : "asc"))
                )
            }
            // if (filtered.length) {
            //     features = filtered.reduce((filteredSoFar, nextFilter) => {
            //         return filteredSoFar.filter(row => {
            //             return (row[nextFilter.id] + "").includes(nextFilter.value)
            //         })
            //     }, features)
            // }
            const pages = Math.ceil(total
                / pagination)

            this.setState({ features, tablePages: pages, featuresIsLoading: false })
        })

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
    geocodeSearch = (text, callback) => {
        this.setState({ geocodeSearchLoading: true })
        GeoCoding.search(text, (result) => {
            this.setState({ geocodeSearchLoading: false })
            callback(result)
        })
    }
    addOverlay = (node) => {
        const { activeFeature, featureIdentifyResult, mouseCoordinates } =
            this.state
        let position = mouseCoordinates
        if (featureIdentifyResult.length > 0) {
            const currentFeature = featureIdentifyResult[activeFeature]
            const featureExtent = currentFeature.getGeometry().getExtent()
            position = BasicViewerHelper.getCenterOfExtent(featureExtent)
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
        }).then((response) => response.json()).then((config) => {
            MapConfigService.load(MapConfigTransformService.transform(
                config), map, urls.proxy)
            const mapLayers = map.getLayers().getArray()
            this.setLayerSwitcherLayers(mapLayers)
            this.createLegends(LayersHelper.getLayers(mapLayers))
            this.setState({ mapIsLoading: false })
        })
    }
    addSelectionLayer = () => {
        let { featureCollection, map } = this.state
        let source = new VectorSource({ features: featureCollection })
        new Vector({
            source: source,
            style: styleFunction,
            title: "Selected Features",
            zIndex: 10000,
            format: new GeoJSON({
                defaultDataProjection: map.getView().getProjection(),
                featureProjection: map.getView().getProjection()
            }),
            map: map
        })
        source.on('addfeature', (e) => {
            Animation.flash(e.feature, map)
        })
    }
    componentWillMount() {
        let { map } = this.state
        this.overlay = new Overlay({
            autoPan: true,
        })
        map.addOverlay(this.overlay)
        this.addSelectionLayer()
        this.mapInit()
    }
    componentDidMount() {
        this.singleClickListner()
    }
    setLayerSwitcherLayers(mapLayers) {
        const { tableLayer } = this.state
        let layers = []
        mapLayers.map(layer => {
            if (!(layer instanceof Group)) {
                layers.push(layer)
            }
        })
        let data = { mapLayers: layers.slice(0).reverse() }
        if (data.mapLayers.length > 0 && (!tableLayer || tableLayer !== '')) {
            data.tableLayer = data.mapLayers[0].get('name')
        }
        this.setState(data, this.getColumns)
    }
    zoomToFeature = (feature) => {
        let { map } = this.state
        this.addStyleToFeature([feature])
        const featureCenter = feature.getGeometry().getExtent()
        const center = BasicViewerHelper.getCenterOfExtent(featureCenter)
        Animation.flyTo(center, map.getView(), 14, () => { })
    }
    zoomToLocation = (pointArray) => {
        let { map } = this.state
        BasicViewerHelper.zoomToLocation(pointArray, map)
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
            const layerTitle = layer.getProperties().title
            legends.push({
                layer: layerTitle,
                url: this.getLegendURL(layerName)
            })
        })
        this.setState({ legends })
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
    featureIdentify = (map, coordinate) => {
        const view = map.getView()
        let identifyPromises = LayersHelper.getLayers(map.getLayers().getArray())
            .map(
                (layer) => FeaturesHelper.readFeaturesThenTransform(
                    this.urls, layer, coordinate, view, map))
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
    exportMap = () => {
        let { map } = this.state
        BasicViewerHelper.exportMap(map)
    }
    render() {
        const { config, urls } = this.props
        let childrenProps = {
            config,
            ...this.state,
            zoomToFeature: this.zoomToFeature,
            addStyleToFeature: this.addStyleToFeature,
            resetFeatureCollection: this.resetFeatureCollection,
            layerName: LayersHelper.layerName,
            layerNameSpace: LayersHelper.layerNameSpace,
            toggleDrawer: this.toggleDrawer,
            urls,
            getFeatures: this.getFeatures,
            getTableData: this.getTableData,
            handleTableLayerChange: this.handleTableLayerChange,
            addOverlay: this.addOverlay,
            changeShowPopup: this.changeShowPopup,
            nextFeature: this.nextFeature,
            previousFeature: this.previousFeature,
            changeLayerOrder: this.changeLayerOrder,
            handleLayerVisibilty: this.handleLayerVisibilty,
            zoomToLocation: this.zoomToLocation,
            exportMap: this.exportMap,
            geocodeSearch: this.geocodeSearch,
            handleFeaturesTableDrawer: this.handleFeaturesTableDrawer
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