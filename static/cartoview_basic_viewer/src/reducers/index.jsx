import {
    activeFeatures,
    attachmentFilesIsLoading,
    featureCollection,
    featureIsLoading,
    features,
    files,
    overlayPopup,
    popupVisible
} from './features'
import { map, mapIsLoading } from './map'

import { combineReducers } from 'redux'
export default combineReducers( {
    features,
    featureIsLoading,
    map,
    overlayPopup,
    files,
    attachmentFilesIsLoading,
    mapIsLoading,
    popupVisible,
    activeFeatures,
    featureCollection
} )
