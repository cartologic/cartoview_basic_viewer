import UrlAssembler from 'url-assembler'

class URLS {
    constructor(urls) {
        this.urls = urls
    }
    encodeURL = (url) => {
        return encodeURIComponent(url).replace(/%20/g, '+')
    }
    getParamterizedURL = (url, query) => {
        let newURL = url
        if (Object.keys(query).length > 0) {
            newURL += '?'
        }
        Object.keys(query).map((key, index) => {
            if (index != 0) {
                newURL += '&'
            }
            newURL += `${key}=${query[key]}`
        })
        return newURL
    }
    getMapApiURL = (username, userMaps = false, limit, offset, query = {}) => {
        let params = {
            'limit': limit,
            'offset': offset,
            ...query
        }
        if (userMaps) {
            params['owner__username'] = username
        }
        const url = UrlAssembler(this.urls.MapsAPI).query(params).toString()
        return url
    }
    getMapApiSearchURL = (username, userMaps = false, text) => {
        let params = { 'title__contains': text }
        if (userMaps) {
            params['owner__username'] = username
        }
        const url = UrlAssembler(this.urls.MapsAPI).query(params).toString()
        return url
    }
    getProxiedURL = (url) => {
        const proxy = this.urls.proxy
        let proxiedURL = url
        if (proxy) {
            proxiedURL = this.urls.proxy + this.encodeURL(url)
        }
        return proxiedURL
    }
}
export default URLS
