import 'ol/ol.css'
import 'Source/css/view.css'
import 'typeface-roboto'

import FeaturesHelper, { wmsGetFeatureInfoFormats } from 'cartoview-sdk/helpers/FeaturesHelper'
import React, { Component } from 'react'

import Animation from 'cartoview-sdk/helpers/AnimationHelper'
import BasicViewer from 'Source/components/view/BasicViewer'
import BasicViewerHelper from 'cartoview-sdk/helpers/BasicViewerHelper'
import Collection from 'ol/collection'
import GeoCoding from 'cartoview-sdk/services/GeoCodingService'
import GeoJSON from 'ol/format/geojson'
import Group from 'ol/layer/group'
import LayersHelper from 'cartoview-sdk/helpers/LayersHelper'
import Overlay from 'ol/overlay'
import PropTypes from 'prop-types'
import StyleHelper from 'cartoview-sdk/helpers/StyleHelper'
import URLS from 'cartoview-sdk/urls/urls'
import Vector from 'ol/layer/vector'
import { default as VectorSource } from 'ol/source/vector'
import WFSService from 'cartoview-sdk/services/WFSService'
import ZoomIcon from 'material-ui-icons/ZoomIn'
import _ from "lodash"
import { arrayMove } from 'react-sortable-hoc'
import proj from 'ol/proj'
import proj4 from 'proj4'
import { render } from 'react-dom'

proj.setProj4(proj4)
class BasicViewerContainer extends Component {
    constructor(props) {
        super(props)
        const { urls } = this.props
        this.state = {
            mapIsLoading: true,
            drawerOpen: false,
            featureIdentifyLoading: false,
            activeFeature: 0,
            cqlFilter: '',
            mouseCoordinates: [0, 0],
            featureIdentifyResult: [],
            showPopup: false,
            identifyEnabled: true,
            legends: [],
            geocodingResult: [],
            searchText: '',
            geocodeSearchLoading: false,
            featureCollection: new Collection(),
            map: BasicViewerHelper.getMap(),
            mapLayers: [],
            baseMaps: [],
            features: [],
            featuresIsLoading: false,
            featuresTableOpen: false,
            tableColumns: [],
            tableLayer: '',
            tablePages: null,
        }
        this.styleHelper = new StyleHelper()
        this.urls = new URLS(urls.proxy)
        this.wfsService = new WFSService(urls.wfsURL, urls.proxy)
    }
    handleFeaturesTableDrawer = () => {
        const { featuresTableOpen } = this.state
        this.setState({ featuresTableOpen: !featuresTableOpen })
    }
    capitalize = (s) => {
        return s && s[0].toUpperCase() + s.slice(1)
    }
    handleCQLFilterChange = (event) => {
        this.setState({ cqlFilter: event.target.value })
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
            featureObject.feature = feature
            featureObject.featureId = feature.getId()
            data.push(featureObject)
        })
        return data
    }
    setThumbnail = () => {
        const { map } = this.state
        const { urls } = this.props
        BasicViewerHelper.setThumbnail(map, urls.thumbnailURL)
    }
    resetGeocoding = () => {
        this.setState({ geocodingResult: [], searchText: '' })
    }
    handleGeocodingChange = event => {
        let data = {
            searchText: event.target.value
        }
        if (event.target.value == '') {
            data.geocodingResult = []
        }
        this.setState(data)
    }
    getColumns = () => {
        const { tableLayer, map } = this.state
        const projectionCode = map.getView().getProjection().getCode()
        this.wfsService.getFeatures(tableLayer, projectionCode, 0, 1).then((data) => {
            let features = wmsGetFeatureInfoFormats[
                'application/json'].readFeatures(data, {
                    featureProjection: map.getView().getProjection()
                })
            let columns = [
                {
                    Header: "Action",
                    id: "action",
                    show: true,
                    Cell: rowInfo => (<div className="element-flex attrs-table-title"><ZoomIcon className="zoom-button" onClick={(e) => this.zoomToFeature(rowInfo.row.feature)} /></div>)

                },
                {

                    Header: "FeatureID",
                    accessor: "featureId"
                },
                {
                    Header: "Action",
                    accessor: "feature",
                    show: false
                }]
            if (features.length > 0) {
                const featureProperties = features[0].getProperties()
                Object.keys(featureProperties).forEach(key => {
                    if (key.toLowerCase() !== 'geometry') {
                        columns.push({
                            id: key,
                            Header: key,
                            accessor: key
                        })
                    }
                })
            }
            this.setState({ tableColumns: columns })
        })

    }
    handleTableLayerChange = event => {
        const layer = event.target.value
        const { tableLayer } = this.state
        if (layer !== tableLayer) {
            this.setState({ tableLayer: event.target.value, features: [], cqlFilter: '' }, () => {
                this.getTableData({ pageSize: 10, sorted: [], page: 0, filtered: [] }, {})
                this.getColumns()
            })
        }

    }
    getTableData = (state, instance) => {
        this.setState({ featuresIsLoading: true })
        const { map, tableLayer, cqlFilter } = this.state
        const projectionCode = map.getView().getProjection().getCode()
        const pagination = state.pageSize
        const sorted = state.sorted
        const page = state.page
        const filtered = state.filtered
        let sortAtrr = null
        let filter = cqlFilter === '' ? null : cqlFilter
        let startIndex = (page) * pagination
        let count = pagination
        if (sorted.length > 0 && sorted[0].id !== 'featureId') {
            sortAtrr = sorted[0].id
            sortAtrr += sorted[0].desc ? "+D" : "+A"
        }
        let featuresPromise = this.wfsService.getFeatures(tableLayer, projectionCode, startIndex, count, sortAtrr, filter)
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
            const pages = Math.ceil(total
                / pagination)
            this.setState({ features, tablePages: pages, featuresIsLoading: false })
        })

    }
    toggleDrawer = () => {
        const { drawerOpen } = this.state
        this.setState({ drawerOpen: !drawerOpen })
    }
    geocodeSearch = (text = null, callback = () => { }) => {
        this.setState({ geocodeSearchLoading: true })
        const { searchText } = this.state
        GeoCoding.search(text ? text : searchText, (result) => {
            this.setState({ geocodeSearchLoading: false, geocodingResult: result })
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
    mapLoaded = () => {
        let { map } = this.state
        const mapLayers = map.getLayers().getArray()
        this.setLayerSwitcherLayers(mapLayers)
        this.createLegends(LayersHelper.getLayers(mapLayers))
        this.setState({ mapIsLoading: false })
    }
    addSelectionLayer = () => {
        let { featureCollection, map } = this.state
        let source = new VectorSource({ features: featureCollection })
        new Vector({
            source: source,
            style: this.styleHelper.styleFunction,
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
        const { urls } = this.props
        this.overlay = new Overlay({
            autoPan: true,
        })
        map.addOverlay(this.overlay)
        this.addSelectionLayer()
        BasicViewerHelper.mapInit(urls.mapJsonUrl, map, urls.proxy, this.mapLoaded)
    }
    componentDidMount() {
        this.singleClickListner()
    }
    setLayerSwitcherLayers(mapLayers) {
        const { tableLayer } = this.state
        let layers = []
        let baseMaps = []
        mapLayers.map(layer => {
            if (!(layer instanceof Group)) {
                layers.push(layer)
            }
            if (layer instanceof Group && layer.get('type') === 'base-group') {
                layer.getLayers().getArray().map(lyr => baseMaps.push(lyr))
            }
        })
        let data = { mapLayers: layers.slice(0).reverse(), baseMaps }
        if (data.mapLayers.length > 0 && (!tableLayer || tableLayer !== '')) {
            data.tableLayer = data.mapLayers[0].get('name')
        }
        this.setState(data, this.getColumns)
    }
    handleBaseMapVisibilty = (event, value) => {
        const { baseMaps } = this.state
        baseMaps.map(layer => {
            if (value === layer.get('id')) {
                layer.setVisible(true)
            } else {
                layer.setVisible(false)
            }
        })
        this.setState({ baseMaps })

    }
    zoomToFeature = (feature) => {
        let { map } = this.state
        this.addStyleToFeature([feature])
        BasicViewerHelper.fitExtent(feature.getGeometry().getExtent(), map, 400)
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
            const layerTitle = layer.getProperties().title
            legends.push({
                layer: layerTitle,
                url: LayersHelper.getLegendURL(layer)
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
        const { urls, config } = this.props
        FeaturesHelper.featureIdentify(map, coordinate, urls.proxy, config.token,
            urls.layerAttributes).then(result => {
                this.setState({
                    featureIdentifyLoading: false,
                    featureIdentifyResult: result,
                    activeFeature: 0,
                    showPopup: true
                }, () => this.addStyleToFeature(
                    result))
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
    getChildrenProps = () => {
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
            setThumbnail: this.setThumbnail,
            getFeatures: this.wfsService.getFeatures,
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
            handleBaseMapVisibilty: this.handleBaseMapVisibilty,
            handleCQLFilterChange: this.handleCQLFilterChange,
            handleFeaturesTableDrawer: this.handleFeaturesTableDrawer,
            handleGeocodingChange: this.handleGeocodingChange,
            resetGeocoding: this.resetGeocoding,
        }
        return childrenProps
    }
    render() {
        return <BasicViewer childrenProps={this.getChildrenProps()} />
    }
}
BasicViewerContainer.propTypes = {
    urls: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired
}
global.BasicViewerContainer = {
    show: (el, props, urls) => {
        render(<BasicViewerContainer urls={urls} config={props} />, document.getElementById(el))
    },
    getComponent: (props, urls) => {
        let App = <BasicViewerContainer urls={urls} config={props} />
        return App
    }
}