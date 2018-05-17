import { doExternalGet } from 'cartoview-sdk/utils/utils'

class OSMGeoCoding {
    search(query, callBack) {
        let url = `https://bcs.boundlessgeo.io/geocode/mapbox/address/${query}?version=0.1&apikey=a5f13a604fa9c9b95dde3f50a3836f76`
        doExternalGet(url).then(result => callBack(result))
    }
}
export default new OSMGeoCoding()
