import { doExternalGet } from 'cartoview-sdk/utils/utils'

class OSMGeoCoding {
    search(query, key, callBack) {
        let url = `https://bcs.boundlessgeo.io/geocode/mapbox/address/${query}?version=0.1&apikey=${key}`
        doExternalGet(url).then(result => callBack(result))
    }
}
export default new OSMGeoCoding()
