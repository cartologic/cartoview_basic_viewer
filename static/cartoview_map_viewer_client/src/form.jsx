import React from 'react';
import t from 'tcomb-form';
import EditService from './services/editService.jsx'
const mapConfig = t.struct({
  title: t.String,
  abstract: t.String,
  showZoombar: t.Boolean,
  showLayerSwitcher: t.Boolean,
  showBaseMapSwitcher: t.Boolean,
  showLegend: t.Boolean
});
const options = {
  fields: {
    abstract: {
      type: 'textarea'
    }
  }
};
const Form = t.form.Form;
import {Button,Row,Col} from 'react-bootstrap';
export default class MapForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mapConfig: {},
    }
    this.EditService = new EditService({api:'/api/',baseUrl:'/'});
  }
  componentDidMount(){
    if(typeof instance_id !== 'undefined'){
      let defaultconf=appConfig;
      defaultconf.title=title;
      defaultconf.abstract=abstract
      this.setState({defaultconf:defaultconf})
    }else{
      this.setState({
        defaultconf: {
         title: this.props.map.title ===''? 'No title': this.props.map.title ,
         abstract: this.props.map.abstract ===''? 'No abstract': this.props.map.abstract,
         showZoombar: true,
         showLayerSwitcher: true,
         showBaseMapSwitcher: true,
         showLegend: true
       }
      })
    }
  }
  save() {
    var value = this.refs.form.getValue();

    if (value) {
      // console.log(value);
      let title= value.title;
      let abstact = value.abstract
      let coreConfig = {
        showZoombar:value.showZoombar,
        showLayerSwitcher:value.showLayerSwitcher,
        showBaseMapSwitcher:value.showBaseMapSwitcher,
        showLegend:value.showLegend

      }

      const config={
        map:this.props.map.id,
        title:value.title,
        abstract:value.abstract,
        config:coreConfig
      }
      this.EditService.save(config,typeof instance_id ==='undefined' ? undefined : instance_id).then((res)=>{
          window.location.href="/apps/cartoview_map_viewer_client/"+res.id+"/edit";
      })

    }
  }
  render() {

    return (
      <div>
        {this.props.map && <div>
          <Row>
            <Col md={6}>
              <Form ref="form" options={options} value={this.state.defaultconf} type={mapConfig}/>
            </Col>
          </Row>
          <Row>
            <Col md={2}>
                <Button bsStyle="primary" onClick={this.save.bind(this)}>Save</Button>
            </Col>
            <Col md={2}>
                {typeof instance_id === 'undefined' ? "" : <Button bsStyle="primary" onClick={()=>window.location.href="/apps/cartoview_map_viewer_client/"+instance_id+"/view"}>View</Button>}
            </Col>
          </Row>
        </div>}



      </div>
    )
  }
}
