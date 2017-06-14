import Events from '../Events.jsx';
export default class EditService{
  constructor(endpointUrl){
    this.url=endpointUrl;
    this.maps=[];
  }
  fetchMaps(){
    return fetch(this.url+"maps").then(function(response) {
      if (response.status == 200)
        return response.json();
      else
        throw new Error('Something went wrong on api server!');
      }
      )
  }
  getMapList(){
    if(this.maps.length==0){
      this.fetchMaps().then((res)=>{
        this.maps=res.objects
        Events.emit("mapsReady",this.maps);
      })
    }else{
      Events.emit("mapsReady",this.maps);
    }


  }
}
