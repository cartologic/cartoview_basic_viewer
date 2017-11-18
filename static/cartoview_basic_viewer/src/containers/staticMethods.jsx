import LayerSwitcher from '../vendor/ol3-layerswitcher/src/ol3-layerswitcher'
import isURL from 'validator/lib/isURL'
import ol from 'openlayers'
export const isWMSLayer = ( layer ) => {
    return layer.getSource( ) instanceof ol.source.TileWMS || layer.getSource( ) instanceof ol
        .source.ImageWMS
}
export const wmsGetFeatureInfoFormats = {
    'application/json': new ol.format.GeoJSON( ),
    'application/vnd.ogc.gml': new ol.format.WMSGetFeatureInfo( )
}
export const getFeatureInfoUrl = ( layer, coordinate, view, infoFormat ) => {
    const resolution = view.getResolution( ),
        projection = view.getProjection( )
    const url = layer.getSource( ).getGetFeatureInfoUrl( coordinate,
        resolution, projection, {
            'INFO_FORMAT': infoFormat
        } )
    return `${url}&FEATURE_COUNT=10`
}
export const getPropertyFromConfig = (config, property, defaultValue) => {
    const propertyValue = config && typeof (config[property]) !==
        "undefined" ? config[property] : defaultValue
    const nestedPropertyValue = config && config.config && typeof (config
        .config[property]) !== "undefined" ? config.config[
        property] : propertyValue
    return nestedPropertyValue
}
export const getMap = ( ) => {
    const map = new ol.Map( {
        interactions: ol.interaction.defaults( ).extend( [
            new ol.interaction.DragRotateAndZoom( )
        ] ),
        layers: [ new ol.layer.Tile( {
            title: 'OpenStreetMap',
            source: new ol.source.OSM( )
        } ) ],
        view: new ol.View( {
            center: [
                0, 0
            ],
            minZoom: 4,
            maxZoom: 16
        } )
    } )
    let layerSwitcher = new LayerSwitcher( )
    map.addControl( layerSwitcher )
    return map
}
export const getWMSLayer = ( name, layers ) => {
    let wmsLayer = null
    layers.forEach( ( layer ) => {
        if ( layer instanceof ol.layer.Group ) {
            wmsLayer = getWMSLayer( name, layer.getLayers( ) )
        } else if ( isWMSLayer( layer ) && layer.getSource( ).getParams( )
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
export const getCenterOfExtent = ( extent ) => {
    const center = ol.extent.getCenter( extent )
    return center
}
export const flyTo = ( location, view, zoom, done ) => {
    var duration = 3000
    var parts = 2
    var called = false

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
    var img = new Image( )
    img.onload = good
    img.onerror = bad
    img.src = src
}
export const getSelectOptions = (arr, label = null, value = null) => {
    let options = []
    if (arr && arr.length > 0) {
        options = arr.map(item => {
            if (!label) {
                return { value: item, label: item }
            }
            return { value: item[label], label: item[value ? value : label] }
        })
    }
    return options

}
const flash = ( feature, map ) => {
    let start = new Date( ).getTime( )
    var listenerKey
    const duration = 5000

    function animate( event ) {
        var vectorContext = event.vectorContext
        var frameState = event.frameState
        var flashGeom = feature.getGeometry( ).clone( )
        var elapsed = frameState.time - start
        var elapsedRatio = elapsed / duration
        // radius will be 5 at start and 30 at end.
        var radius = ol.easing.easeOut( elapsedRatio ) * 25 + 5
        var opacity = ol.easing.easeOut( 1 - elapsedRatio )
        var style = new ol.style.Style( {
            image: new ol.style.Circle( {
                radius: radius,
                snapToPixel: false,
                stroke: new ol.style.Stroke( {
                    color: 'rgba(21, 84, 75,' +
                        opacity + ')',
                    width: 0.25 + opacity
                } )
            } )
        } )
        vectorContext.setStyle( style );
        vectorContext.drawGeometry( flashGeom )
        if ( elapsed > duration ) {
            ol.Observable.unByKey( listenerKey )
            return
        }
        // tell OpenLayers to continue postcompose animation
        map.render( )
    }
    listenerKey = map.on( 'postcompose', animate )
}
export const addSelectionLayer = ( map, featureCollection, styleFunction ) => {
    let source = new ol.source.Vector( { features: featureCollection } )
    new ol.layer.Vector( {
        source: source,
        style: styleFunction,
        title: "Selected Features",
        zIndex: 10000,
        format: new ol.format.GeoJSON( {
            defaultDataProjection: map.getView( ).getProjection( ),
            featureProjection: map.getView( ).getProjection( )
        } ),
        map: map
    } )
    source.on( 'addfeature', ( e ) => {
        flash( e.feature, map )
    } )
}
export const getLayers = ( layers ) => {
    var children = [ ]
    layers.forEach( ( layer ) => {
        if ( layer instanceof ol.layer.Group ) {
            children = children.concat( getLayers( layer.getLayers( ) ) )
        } else if ( layer.getVisible( ) && isWMSLayer( layer ) ) {
            children.push( layer )
        }
    } )
    return children
}
export const layerName = ( typeName ) => {
    return typeName.split( ":" ).pop( )
}
export const layerNameSpace = ( typeName ) => {
    return typeName.split( ":" )[ 0 ]
}
