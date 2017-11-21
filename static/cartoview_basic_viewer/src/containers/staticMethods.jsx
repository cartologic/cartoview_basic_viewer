import Circle from 'ol/style/circle'
import DragRotateAndZoom from 'ol/interaction/dragrotateandzoom'
import FullScreen from 'ol/control/fullscreen'
import GeoJSON from 'ol/format/geojson'
import Group from 'ol/layer/group'
import ImageWMS from 'ol/source/imagewms'
import Map from 'ol/map'
import OSM from 'ol/source/osm'
import Observable from 'ol/observable'
import OverviewMap from 'ol/control/overviewmap'
import Stroke from 'ol/style/stroke'
import Style from 'ol/style/style'
import Tile from 'ol/layer/tile'
import TileWMS from 'ol/source/tilewms'
import Vector from 'ol/layer/vector'
import {default as VectorSource} from 'ol/source/vector'
import View from 'ol/view'
import WMSGetFeatureInfo from 'ol/format/wmsgetfeatureinfo'
import easing from 'ol/easing'
import extent from 'ol/extent'
import interaction from 'ol/interaction'
import isURL from 'validator/lib/isURL'
import proj from 'ol/proj'
import style from 'ol/style'

export const isWMSLayer = ( layer ) => {
    return layer.getSource() instanceof TileWMS || layer.getSource() instanceof ImageWMS
}
export const wmsGetFeatureInfoFormats = {
    'application/json': new GeoJSON(),
    'application/vnd.ogc.gml': new WMSGetFeatureInfo()
}
export const getFeatureInfoUrl = ( layer, coordinate, view, infoFormat ) => {
    const resolution = view.getResolution(),
        projection = view.getProjection()
    const url = layer.getSource().getGetFeatureInfoUrl( coordinate,
        resolution, projection, {
            'INFO_FORMAT': infoFormat
        } )
    return `${url}&FEATURE_COUNT=10`
}
export const getPropertyFromConfig = ( config, property, defaultValue ) => {
    const propertyValue = config && typeof ( config[ property ] ) !==
        "undefined" ? config[ property ] : defaultValue
    const nestedPropertyValue = config && config.config && typeof ( config
        .config[ property ] ) !== "undefined" ? config.config[
        property ] : propertyValue
    return nestedPropertyValue
}
export function getMap() {
    let osmLayer=new Tile( {
        title: 'OpenStreetMap',
        source: new OSM()
    } )
    let map = new Map( {
        interactions: interaction.defaults().extend( [
            new DragRotateAndZoom()
        ] ),
        layers: [ osmLayer ],
        view: new View( {
            center: proj.fromLonLat([0,0]),
            minZoom: 4,
            maxZoom: 16,
            zoom:6
        } )
    } )
    map.addControl( new OverviewMap() )
    map.addControl( new FullScreen({source:"root"}) )
    return map
}
export const getWMSLayer = ( name, layers ) => {
    let wmsLayer = null
    layers.forEach( ( layer ) => {
        if ( layer instanceof Group ) {
            wmsLayer = getWMSLayer( name, layer.getLayers() )
        } else if ( isWMSLayer( layer ) && layer.getSource().getParams()
            .LAYERS == name ) {
            wmsLayer = layer
        }
        if ( wmsLayer ) {
            return false
        }
    } )
    return wmsLayer
}
export const checkURL = ( value ) => {
    /* validator validate strings only */
    if ( typeof ( value ) === "string" ) {
        return isURL( value )
    }
    return false
}
export const getCenterOfExtent = ( ext ) => {
    const center = extent.getCenter( ext )
    return center
}
export const flyTo = ( location, view, zoom, done ) => {
    let duration = 3000
    let parts = 2
    let called = false

    function callback( complete ) {
        --parts
        if ( called ) {
            return
        }
        if ( parts === 0 || !complete ) {
            called = true
            done( complete )
        }
    }
    view.animate( {
        center: location,
        duration: duration
    }, callback )
    view.animate( {
        zoom: zoom - 1,
        duration: duration / 2
    }, {
        zoom: zoom,
        duration: duration / 2
    }, callback )
}
export const checkImageSrc = ( src, good, bad ) => {
    let img = new Image()
    img.onload = good
    img.onerror = bad
    img.src = src
}
export const getSelectOptions = ( arr, label = null, value = null ) => {
    let options = []
    if ( arr && arr.length > 0 ) {
        options = arr.map( item => {
            if ( !label ) {
                return { value: item, label: item }
            }
            return { value: item[ label ], label: item[ value ?
                    value : label ] }
        } )
    }
    return options
}
const flash = ( feature, map ) => {
    let start = new Date().getTime()
    let listenerKey
    const duration = 5000

    function animate( event ) {
        let vectorContext = event.vectorContext
        let frameState = event.frameState
        let flashGeom = feature.getGeometry().clone()
        let elapsed = frameState.time - start
        let elapsedRatio = elapsed / duration
        // radius will be 5 at start and 30 at end.
        let radius = easing.easeOut( elapsedRatio ) * 25 + 5
        let opacity = easing.easeOut( 1 - elapsedRatio )
        let featureStyle = new Style( {
            image: new Circle( {
                radius: radius,
                snapToPixel: false,
                stroke: new Stroke( {
                    color: 'rgba(21, 84, 75,' +
                        opacity + ')',
                    width: 0.25 + opacity
                } )
            } )
        } )
        vectorContext.setStyle( featureStyle )
        vectorContext.drawGeometry( flashGeom )
        if ( elapsed > duration ) {
            Observable.unByKey( listenerKey )
            return
        }
        // tell OpenLayers to continue postcompose animation
        map.render()
    }
    listenerKey = map.on( 'postcompose', animate )
}
export const addSelectionLayer = ( map, featureCollection, styleFunction ) => {
    let source = new VectorSource( { features: featureCollection } )
    new Vector( {
        source: source,
        style: styleFunction,
        title: "Selected Features",
        zIndex: 10000,
        format: new GeoJSON( {
            defaultDataProjection: map.getView().getProjection(),
            featureProjection: map.getView().getProjection()
        } ),
        map: map
    } )
    source.on( 'addfeature', ( e ) => {
        flash( e.feature, map )
    } )
}
export const getLayers = ( layers ) => {
    let children = []
    layers.forEach( ( layer ) => {
        if ( layer instanceof Group ) {
            children = children.concat( getLayers( layer.getLayers() ) )
        } else if ( layer.getVisible() && isWMSLayer( layer ) ) {
            children.push( layer )
        }
    } )
    return children
}
export const layerName = ( typeName ) => {
    return typeName.split( ":" ).pop()
}
export const layerNameSpace = ( typeName ) => {
    return typeName.split( ":" )[ 0 ]
}
