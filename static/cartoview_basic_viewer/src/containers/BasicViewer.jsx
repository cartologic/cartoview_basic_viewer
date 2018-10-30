import 'ol/ol.css'
import 'Source/css/view.css'
import 'typeface-roboto'
import 'whatwg-fetch'
import 'babel-polyfill'

import { BOUNDLESS_GEOCODING_URL, BOUNDLESS_SETTINGS, ESRI_GEOCODING_URL, ESRI_SETTINGS, Geocoding } from 'cartoview-sdk/services/GeoCodingService'
import FeaturesHelper, { wmsGetFeatureInfoFormats } from 'cartoview-sdk/helpers/FeaturesHelper'
import React, { Component } from 'react'

import Animation from 'cartoview-sdk/helpers/AnimationHelper'
import BasicViewer from 'Source/components/view/BasicViewer'
import BasicViewerHelper from 'cartoview-sdk/helpers/BasicViewerHelper'
import Collection from 'ol/collection'
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
import { arrayMove } from 'react-sortable-hoc'
import { doPost } from 'cartoview-sdk/utils/utils'
import { downloadFile } from 'cartoview-sdk/utils/utils'
import proj from 'ol/proj'
import proj4 from 'proj4'
import { render } from 'react-dom'

const INITIAL_TYPE_MAPPING = {
    string: "text",
    double: "number",
    int: "number",
    number: "number",
    long: "number",
    boolean: "checkbox",
    "date-time": "datetime",
    date: "date",
}
const MAXFEATURES = 25
proj.setProj4(proj4)
class BasicViewerContainer extends Component {
    constructor(props) {
        super(props)
        const { urls, config } = this.props
        this.state = {
            mapIsLoading: true,
            drawerOpen: false,
            featureIdentifyLoading: false,
            activeFeature: 0,
            mouseCoordinates: [0, 0],
            featureIdentifyResult: [],
            layerAttributes: [],
            searchEnabled: false,
            attributesLoading: false,
            showPopup: false,
            thumbnailSaving: false,
            identifyEnabled: true,
            geocodingResult: [],
            searchText: '',
            geocodeSearchLoading: false,
            featureCollection: new Collection(),
            map: BasicViewerHelper.getMap(),
            mapLayers: [],
            combinationType: 'any',
            selectedRegion: "",
            baseMaps: [],
            filters: [],
            features: [],
            totalFeatures: 0,
            featuresIsLoading: false,
            featuresTableOpen: false,
            tableLayer: '',
            page: 0,
            rowsPerPage: 25,
            printOpened: false,

        }
        global.map = this.state.map
        this.styleHelper = new StyleHelper()
        this.urls = new URLS(urls.proxy)
        this.wfsService = new WFSService(urls.wfsURL, urls.proxy)
        this.initGeocoding()
    }
    initGeocoding() {
        let url = null
        let settings = null
        const { config } = this.props
        if (config.boundlessGeoCodingEnabled) {
            url = BOUNDLESS_GEOCODING_URL
            settings = {
                ...BOUNDLESS_SETTINGS,
                apikey: config.geocodingKey || ""
            }

        } else {
            url = ESRI_GEOCODING_URL
            settings = { ...ESRI_SETTINGS }
        }
        this.geocoding = new Geocoding(url, settings)
    }
    handleLayerOpacity = (layerIndex) => (value) => {
        let { mapLayers } = this.state
        const layer = mapLayers[layerIndex]
        layer.setOpacity(value)
        this.setState({ mapLayers })
    }
    createQueryPanel = () => {
        const { filters } = this.state
        let filter = {
            op: "",
            value: "",
            start: new Date().toISOString(),
            end: new Date().toISOString(),
            attribute: ""
        }
        this.setState({ filters: [...filters, filter] })
    }
    removeComponent = (index) => {
        let { filters } = this.state
        let newComponents = filters
        newComponents.splice(index, 1)
        this.setState({ filters: newComponents })
    }
    resetQuery = () => {
        if (this.state.filters.length > 0) {
            this.setState({ filters: [] }, () => {
                this.getFeatureTableData(0, 25, this.state.tableLayer, false)
            })
        }
    }
    handleFilterChange = (index) => event => {
        let { filters } = this.state
        if (index < filters.length) {
            let newFilters = filters
            let filter = newFilters[index]
            filter[event.target.name] = event.target.value
            this.setState({ filters: newFilters })
        }
    }
    handlePageChange = (event, newPage) => {
        this.setState({ page: newPage }, () => {
            this.getFeatureTableData((this.state.page) * this.state.rowsPerPage, this.state.rowsPerPage)
        })
    }
    handleRowsPerPage = (event) => {
        this.setState({ rowsPerPage: event.target.value }, () => {
            this.getFeatureTableData((this.state.page) * this.state.rowsPerPage, this.state.rowsPerPage)
        })
    }
    handlePrintModal = () => {
        this.setState({ printOpened: !this.state.printOpened })
    }
    handleFeaturesTableDrawer = () => {
        const { featuresTableOpen } = this.state
        this.setState({ featuresTableOpen: !featuresTableOpen })
    }
    handleCombinationType = event => {
        const combType = event.target.value
        const { combinationType } = this.state
        if (combType !== combinationType) {
            this.setState({ combinationType: combType })
        }

    }
    capitalize = (s) => {
        return s && s[0].toUpperCase() + s.slice(1)
    }
    resetTablePagination = () => {
        this.setState({ page: 0, rowsPerPage: 25 })
    }
    handleNonDownload = (data) => {
        const { urls } = this.props
        const targerURL = this.urls.getProxiedURL(urls.wfsURL)
        doPost(targerURL, data).then(res => {
            let data = {
                features: wmsGetFeatureInfoFormats[
                    'application/json'].readFeatures(
                        res),
                featuresIsLoading: false,
                totalFeatures: res.totalFeatures
            }
            this.setState(data)
        })
    }
    handleDownloadFiltered = (data) => {
        const { tableLayer } = this.state
        const { urls } = this.props
        const targerURL = this.urls.getProxiedURL(urls.wfsURL)
        downloadFile(targerURL, `${tableLayer.split(":").pop()}.zip`, data)
    }
    isValid = (filterObj) => {
        const { value, attribute, op, start, end } = filterObj
        let valid = false
        if (op !== "DURING") {
            if (value && attribute && op) {
                valid = true
            }
        } else {
            if (start && end && attribute && op) {
                valid = true
            }
        }
        return valid
    }
    getAttributeType = (attributeName) => {
        const { layerAttributes } = this.state
        let attributeType = null
        for (let i = 0; i < layerAttributes.length; i++) {
            const attr = layerAttributes[i]
            if (attr.name === attributeName) {
                attributeType = attr.type.split(":").pop()
                break
            }
        }
        return attributeType
    }
    getFilterObj = (filterObj) => {
        const attrType = this.getAttributeType(this.state.attribute)
        const localType = INITIAL_TYPE_MAPPING[attrType]
        const { value, attribute, op, start, end } = filterObj
        if (this.isValid(filterObj)) {
            if (op === "DURING") {
                return {
                    attribute, operator: op, value,
                    start: new Date(start).toISOString(),
                    end: new Date(end).toISOString()
                }
            }
            if (localType === "date" || localType === "datetime") {
                return { attribute, operator: op, value: new Date(start).toISOString() }
            }
            return { attribute, operator: op, value }
        }
    }
    getFeatureTableData = (startIndex, maxFeatures, tableLayer = null, download = false) => {
        const { filters, map, combinationType } = this.state
        let filterObjs = []
        filters.map(filter => {
            if (this.isValid(filter)) {
                filterObjs.push(this.getFilterObj(filter))
            }
        })
        if (!tableLayer) {
            tableLayer = this.state.tableLayer
        }
        if (tableLayer) {
            let wfsOptions = {
                filters: filterObjs,
            }
            if (!download) {
                this.setState({ featuresIsLoading: true, searchEnabled: filterObjs ? true : false })
                wfsOptions = {
                    ...wfsOptions,
                    combinationType,
                    maxFeatures,
                    startIndex,
                    pagination: true,
                    outputFormat: 'application/json'
                }
            } else {
                wfsOptions = {
                    ...wfsOptions,
                    outputFormat: "shape-zip"
                }
            }
            this.wfsService.writeWFSGetFeature(map, tableLayer, wfsOptions).then(request => {
                let data = new XMLSerializer().serializeToString(request)
                if (!download) {
                    this.handleNonDownload(data)
                } else {
                    this.handleDownloadFiltered(data)
                }
            })
        }
    }
    setThumbnail = () => {
        const { map } = this.state
        const { urls } = this.props
        this.setState({ thumbnailSaving: true }, () => {
            BasicViewerHelper.setThumbnail(map, urls.thumbnailURL).then(result => {
                this.setState({ thumbnailSaving: false }, alert(result))
            })
        })
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
    getTableLayerAttributes = () => {
        const { tableLayer } = this.state
        this.setState({ attributesLoading: true })
        this.wfsService.describeFeatureType(tableLayer).then(result => {
            let data = { attributesLoading: false }
            if (result.featureTypes.length > 0) {
                data["layerAttributes"] = result.featureTypes[0].properties.filter(attr => attr.name !== "the_geom")
            }
            this.setState(data)
        })

    }
    handleTableLayerChange = event => {
        const layer = event.target.value
        const { tableLayer } = this.state
        if (layer !== tableLayer) {
            this.setState({ tableLayer: event.target.value, features: [], page: 0, rowsPerPage: 25 }, () => {
                this.getTableLayerAttributes()
                this.getFeatureTableData(0, MAXFEATURES, layer)
            })
        }

    }
    toggleDrawer = () => {
        const { drawerOpen } = this.state
        this.setState({ drawerOpen: !drawerOpen })
    }
    geocodeSearch = (text = null, callback = () => { }) => {
        this.setState({ geocodeSearchLoading: true })
        const { searchText } = this.state
        this.geocoding.search(text ? text : searchText, (result) => {
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
            const geometry = currentFeature.getGeometry()
            position = FeaturesHelper.getGeometryCenter(geometry)
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
        const { urls, config } = this.props
        this.overlay = new Overlay({
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            },
            positioning: 'center-center'
        })
        map.addOverlay(this.overlay)
        this.addSelectionLayer()
        BasicViewerHelper.mapInit(urls.mapJsonUrl, map, urls.proxy, config.token, this.mapLoaded)
    }
    componentDidMount() {
        this.singleClickListner()
    }
    downloadLayer = (typeName) => {
        //TODO: check download permission
        const { config } = this.props
        const downloadURL = this.wfsService.buildGetFeatureURL(typeName, undefined,
            undefined, undefined, undefined, undefined, "shape-zip", config.token)
        downloadFile(downloadURL, `${typeName}.zip`)
    }
    setLayerSwitcherLayers(mapLayers) {
        const { tableLayer } = this.state
        let layers = []
        let baseMaps = []
        mapLayers.map(layer => {
            if (!(layer instanceof Group)) {
                layers.push(layer)
            }
            else if (layer instanceof Group && layer.get('type') === 'base-group') {
                layer.getLayers().getArray().map(lyr => baseMaps.push(lyr))
            }
        })
        let data = { mapLayers: layers.slice(0).reverse(), baseMaps }
        if (data.mapLayers.length > 0 && (!tableLayer || tableLayer !== '')) {
            data.tableLayer = data.mapLayers[0].get('name')
            this.getFeatureTableData(0, MAXFEATURES, data.tableLayer)
        }
        this.setState(data, () => {
            this.createLegends()
            this.getTableLayerAttributes()
        })
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
    zoomToExtent = (extent) => {
        let { map } = this.state
        BasicViewerHelper.fitExtent(BasicViewerHelper.reprojectExtent(extent, map), map)
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
    createLegends = () => {
        let { mapLayers } = this.state
        const { config, urls } = this.props
        let legends = []
        mapLayers.map(layer => {
            const layerTitle = layer.getProperties().title
            if (layer.getVisible()) {
                legends.push({
                    layer: layerTitle,
                    url: LayersHelper.getLegendURL(layer, config.token, urls.proxy)
                })
            }
        })
        return legends
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
            }).catch(err => {
                this.setState({ featureIdentifyLoading: false }, alert(err.text()))
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
            handlePrintModal: this.handlePrintModal,
            downloadLayer: this.downloadLayer,
            zoomToFeature: this.zoomToFeature,
            addStyleToFeature: this.addStyleToFeature,
            resetFeatureCollection: this.resetFeatureCollection,
            layerName: LayersHelper.layerName,
            layerNameSpace: LayersHelper.layerNameSpace,
            toggleDrawer: this.toggleDrawer,
            urls,
            handleFilterChange: this.handleFilterChange,
            handleCombinationType: this.handleCombinationType,
            createLegends: this.createLegends,
            setThumbnail: this.setThumbnail,
            getFeatures: this.wfsService.getFeatures,
            wfsService: this.wfsService,
            handleTableLayerChange: this.handleTableLayerChange,
            addOverlay: this.addOverlay,
            changeShowPopup: this.changeShowPopup,
            nextFeature: this.nextFeature,
            previousFeature: this.previousFeature,
            changeLayerOrder: this.changeLayerOrder,
            handleLayerVisibilty: this.handleLayerVisibilty,
            zoomToLocation: this.zoomToLocation,
            zoomToExtent: this.zoomToExtent,
            resetTablePagination: this.resetTablePagination,
            exportMap: this.exportMap,
            geocodeSearch: this.geocodeSearch,
            handlePageChange: this.handlePageChange,
            handleRowsPerPage: this.handleRowsPerPage,
            handleBaseMapVisibilty: this.handleBaseMapVisibilty,
            getFeatureTableData: this.getFeatureTableData,
            createQueryPanel: this.createQueryPanel,
            removeComponent: this.removeComponent,
            resetQuery: this.resetQuery,
            handleFeaturesTableDrawer: this.handleFeaturesTableDrawer,
            handleGeocodingChange: this.handleGeocodingChange,
            resetGeocoding: this.resetGeocoding,
            handleLayerOpacity: this.handleLayerOpacity,
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