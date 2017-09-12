import MapConfigService from '@boundlessgeo/sdk/services/MapConfigService'
import MapConfigTransformService from '@boundlessgeo/sdk/services/MapConfigTransformService'
import { viewStore } from '../store/stores'
export function setMap(map) {
    return {
        type: 'SET_MAP',
        map
    }
}
export function mapIsLoading(mapLoading) {
    return {
        type: 'MAP_IS_LOADING',
        mapLoading
    }
}
export const loadMap = (mapUrl) => {
    return (dispatch) => {
        dispatch(mapIsLoading(true))
        fetch(mapUrl, {
            method: "GET",
            credentials: 'include'
        }).then((response) => {
            if (response.status == 200) {
                return response.json();
            }
        }).then((config) => {
            if (config) {
                MapConfigService.load(MapConfigTransformService.transform(config),viewStore.getState().map)
                dispatch(mapIsLoading(false))

            }
        })
    }
}