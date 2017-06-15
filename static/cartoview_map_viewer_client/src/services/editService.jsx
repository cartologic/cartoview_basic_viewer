import Events from '../Events.jsx';
import {getCRSFToken,hasTrailingSlash} from '../helpers/helpers.jsx'
export default class EditService {
  constructor(urls) {
    this.api = urls.api;
    this.baseUrl = urls.baseUrl
    this.maps = [];
  }
  fetchMaps() {
    return fetch(this.api + "maps").then(function(response) {
      if (response.status == 200)
        return response.json();
      else
        throw new Error('Something went wrong on api server!');
      }
    )
  }
  getMapList() {
    if (this.maps.length == 0) {
      this.fetchMaps().then((res) => {
        this.maps = res.objects
        Events.emit("mapsReady", this.maps);
      })
    } else {
      Events.emit("mapsReady", this.maps);
    }
  }
  save(instanceConfig, id) {
    console.log(instanceConfig);
    console.log(getCRSFToken());
    const url = id
      ? this.baseUrl + "apps/cartoview_map_viewer_client/edit"
      : this.baseUrl + "apps/cartoview_map_viewer_client/new"
    return fetch(hasTrailingSlash(url) ? url : url+"/" , {
      method: 'POST',
      // credentials: "include",
      // headers: {
      //
      //   'Content-Type': 'application/json',
      //   "X-CSRF_TOKEN": getCRSFToken()
      // },
      credentials: "same-origin",
      headers: new Headers({
        "Content-Type": "application/json; charset=UTF-8",
        "X-CSRFToken": getCRSFToken()
      }),
      body: JSON.stringify(instanceConfig)
    }).then((response)=>response.json())
  }
}
