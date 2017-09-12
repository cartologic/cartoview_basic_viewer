import ol from 'openlayers'
export function featureIsLoading( state = false, action ) {
    switch ( action.type ) {
    case 'FEATURES_IS_LOADING':
        return action.isLoading
    default:
        return state
    }
}
export function attachmentFilesIsLoading( state = false, action ) {
    switch ( action.type ) {
    case 'ATTACHMENT_FILES_IS_LOADING':
        return action.isLoading
    default:
        return state
    }
}
export function popupVisible( state = false, action ) {
    switch ( action.type ) {
    case 'SET_VISIBLE':
        return action.visible
    default:
        return state
    }
}
export function activeFeatures( state = 0, action ) {
    switch ( action.type ) {
    case 'SET_ACTIVE_FEATURES':
        return action.activeFeature
    case 'ACTIVE_FEATURES_INCREMENT':
        return state + 1
    case 'ACTIVE_FEATURES_DECREMENT':
        return state - 1
    default:
        return state
    }
}
export function features( state = [ ], action ) {
    switch ( action.type ) {
    case 'SET_FEATURES':
        return action.features
    case 'ADD_FEATURES':
        return [ ...state, ...action.features ]
    default:
        return state
    }
}
let featureCollection_obj = new ol.Collection( )
export function featureCollection( state = featureCollection_obj, action ) {
    switch ( action.type ) {
    case 'ADD_FEATURES_COLLECTION':
        return action.featureCollection
    default:
        return state
    }
}
export function overlayPopup( state = null, action ) {
    switch ( action.type ) {
    case 'SET_OVERLAY':
        return action.overlayPopup
    default:
        return state
    }
}
export function files( state = [ ], action ) {
    switch ( action.type ) {
    case 'GET_ATTACHMENT_FILES_SUCCESS':
        return action.files
    default:
        return state
    }
}
