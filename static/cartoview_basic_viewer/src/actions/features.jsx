import ol from 'openlayers'
import { styleFunction } from './styling'
import { viewStore } from '../store/stores'
export function featuresIsLoading( bool ) {
    return {
        type: 'FEATURES_IS_LOADING',
        isLoading: bool
    }
}
export function setActiveFeatures( activeFeature ) {
    return {
        type: 'SET_ACTIVE_FEATURES',
        activeFeature
    }
}
export function activeFeaturesIncrement( ) {
    return {
        type: 'ACTIVE_FEATURES_INCREMENT'
    }
}
export function activeFeaturesDecrement( ) {
    return {
        type: 'ACTIVE_FEATURES_DECREMENT'
    }
}
export function setPopupVisible( visible ) {
    return {
        type: 'SET_VISIBLE',
        visible
    }
}
export function setFeatures( features ) {
    return {
        type: 'SET_FEATURES',
        features
    }
}
export function setOverlayPopup( overlayPopup ) {
    return {
        type: 'SET_OVERLAY',
        overlayPopup
    }
}
export function addFeatures( features ) {
    return {
        type: 'ADD_FEATURES',
        features
    }
}
export function addFeaturesCollection( featureCollection ) {
    return {
        type: 'ADD_FEATURES_COLLECTION',
        featureCollection
    }
}
export function getAttachmentFilesSuccess( files ) {
    return {
        type: 'GET_ATTACHMENT_FILES_SUCCESS',
        files
    }
}
export function attachmentFilesIsLoading( bool ) {
    return {
        type: 'ATTACHMENT_FILES_IS_LOADING',
        isLoading: bool
    }
}
const wmsGetFeatureInfoFormats = {
    'application/json': new ol.format.GeoJSON( ),
    'application/vnd.ogc.gml': new ol.format.WMSGetFeatureInfo( )
}
const getFeatureInfoUrl = ( layer, coordinate, view, infoFormat ) => {
    var resolution = view.getResolution( ),
        projection = view.getProjection( )
    var url = layer.getSource( ).getGetFeatureInfoUrl( coordinate,
        resolution, projection, {
            'INFO_FORMAT': infoFormat
        } )
    return url + "&FEATURE_COUNT=10"
}
const isWMS = ( layer ) => {
    return layer.getSource( ) instanceof ol.source.TileWMS || layer.getSource( ) instanceof ol
        .source.ImageWMS;
}
const getLayers = ( layers ) => {
    var children = [ ]
    layers.forEach( ( layer ) => {
        if ( layer instanceof ol.layer.Group ) {
            children = children.concat( getLayers( layer.getLayers( ) ) )
        } else if ( layer.getVisible( ) && isWMS( layer ) ) {
            children.push( layer )
        }
    } )
    return children
}
const transformAndShowPopup = ( layer, features, map, overlayPopup, coordinate,
    crs ) => {
    return ( dispatch ) => {
        if ( features.length > 0 ) {
            let transformedFeatures = [ ]
            features.forEach( ( feature ) => {
                feature.getGeometry( ).transform( 'EPSG:' +
                    crs, map.getView( ).getProjection( ) )
                feature.set( "_layerTitle", layer.get( 'title' ) )
                transformedFeatures.push( feature )
            } )
            overlayPopup.setPosition( coordinate )
            dispatch( addFeatures( transformedFeatures ) )
            dispatch( setActiveFeatures( 0 ) )
            dispatch( setPopupVisible( true ) )
            dispatch( featuresIsLoading( false ) )
            document.body.style.cursor = "default"
        } else {
            overlayPopup.setPosition( coordinate )
            dispatch( setPopupVisible( true ) )
            dispatch( featuresIsLoading( false ) )
            document.body.style.cursor = "default"
        }
    }
}
export function featureIdentify( map, overlayPopup, coordinate ) {
    return ( dispatch ) => {
        dispatch( setPopupVisible( false ) )
        dispatch( featuresIsLoading( true ) )
        getLayers( map.getLayers( ).getArray( ) ).forEach(
            ( layer ) => {
                const view = map.getView( )
                const url = getFeatureInfoUrl( layer, coordinate, view,
                    'application/json' )
                fetch( url ).then( ( response ) => response.json( ) ).then(
                    ( result ) => {
                        if ( result.features.length > 0 ) {
                            const features =
                                wmsGetFeatureInfoFormats[
                                    'application/json' ].readFeatures(
                                    result )
                            const crs = result.features.length > 0 ?
                                result.crs.properties.name.split(
                                    ":" ).pop( ) : null
                            if ( proj4.defs( 'EPSG:' + crs ) ) {
                                dispatch( transformAndShowPopup(
                                    layer, features, map,
                                    overlayPopup,
                                    coordinate, crs ) )
                            } else {
                                fetch(
                                    "https://epsg.io/?format=json&q=" +
                                    crs ).then( response =>
                                    response.json( ) ).then(
                                    projres => {
                                        proj4.defs( 'EPSG:' +
                                            crs, projres.results[
                                                0 ].proj4 )
                                        dispatch(
                                            transformAndShowPopup(
                                                layer,
                                                features,
                                                map,
                                                overlayPopup,
                                                coordinate,
                                                crs ) )
                                    } )
                            }
                        } else {
                            overlayPopup.setPosition( coordinate )
                            dispatch( setPopupVisible( true ) )
                            dispatch( featuresIsLoading( false ) )
                            document.body.style.cursor = "default"
                        }
                        if ( viewStore.getState( ).features.length >
                            0 ) {
                            dispatch( addStyleToFeature( ) )
                        }
                    } )
            } )
    }
}
export const loadAttachments = ( url ) => {
    return ( dispatch ) => {
        dispatch( attachmentFilesIsLoading( true ) )
        fetch( url ).then( ( response ) => response.json( ) ).then( (
            data ) => {
            dispatch( attachmentFilesIsLoading( false ) )
            dispatch( getAttachmentFilesSuccess( data ) )
        } ).catch( ( error ) => {
            throw Error( error )
        } )
    }
}
export const zoomToFeature = ( feature ) => {
    return ( dispatch ) => {
        let map = viewStore.getState( ).map
        map.getView( ).fit( feature.getGeometry( ).getExtent( ), map.getSize( ), { duration: 10000 } )
    }
}
export const singleClickListner = ( map = viewStore.getState( ).map,
    overlayPopup = viewStore.getState( ).overlayPopup, afterInit =
    featureIdentify ) => {
    return ( dispatch ) => {
        map.addOverlay( overlayPopup )
        map.on( 'singleclick', ( e ) => {
            dispatch( featuresIsLoading( true ) )
            dispatch( setActiveFeatures( 0 ) )
            dispatch( setFeatures( [ ] ) )
            document.body.style.cursor = "progress"
            dispatch( afterInit( map, overlayPopup, e.coordinate ) )
        } )
    }
}
export const addSelectionLayer = ( featureCollection = viewStore.getState( ).featureCollection,
    map = viewStore.getState( ).map ) => {
    return ( dispatch ) => {
        new ol.layer.Vector( {
            source: new ol.source.Vector( { features: featureCollection } ),
            style: styleFunction,
            title: "Selected Features",
            zIndex: 10000,
            format: new ol.format.GeoJSON( {
                defaultDataProjection: map.getView( ).getProjection( ),
                featureProjection: map.getView( ).getProjection( )
            } ),
            map: map
        } )
    }
}
export const addStyleToFeature = ( ) => {
    return ( dispatch ) => {
        let { features, featureCollection, activeFeatures } =
        viewStore.getState( )
        if ( features.length > 0 ) {
            featureCollection.clear( )
            featureCollection.push( features[ activeFeatures ] )
        }
    }
}
export const next = ( ) => {
    return ( dispatch ) => {
        dispatch( activeFeaturesIncrement( ) )
        let { overlayPopup, activeFeatures, features } = viewStore.getState( )
        overlayPopup.setPosition( features[ activeFeatures ].getGeometry( )
            .getCoordinates( ) )
    }
}
export const prev = ( ) => {
    return ( dispatch ) => {
        dispatch( activeFeaturesDecrement( ) )
        let { overlayPopup, activeFeatures, features } = viewStore.getState( )
        overlayPopup.setPosition( features[ activeFeatures ].getGeometry( )
            .getLastCoordinate( ) )
    }
}
