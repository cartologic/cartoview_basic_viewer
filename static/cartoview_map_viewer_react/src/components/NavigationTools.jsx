import React, {Component} from 'react';
import t from 'tcomb-form';
const mapConfig = t.struct({
  showZoombar: t.Boolean,
  showLayerSwitcher: t.Boolean,
  showBaseMapSwitcher: t.Boolean,
  showLegend: t.Boolean
});
const Form = t.form.Form;


export default class NavigationTools extends Component {
  constructor(props) {
    super(props)
    this.state = {
      defaultconf: {
        showZoombar: this.props.config
          ? this.props.config.showZoombar
          : true,
        showLayerSwitcher: this.props.config
          ? this.props.config.showLayerSwitcher
          : true,
        showBaseMapSwitcher: this.props.config
          ? this.props.config.showBaseMapSwitcher
          : true,
        showLegend: this.props.config
          ? this.props.config.showBaseMapSwitcher
          : true
      }
    }
  }
  componentDidMount() {}
  save() {
    var basicConfig = this.refs.form.getValue();
    if (basicConfig) {
      const properConfig = {
        config: {
          showZoombar: basicConfig.showZoombar,
          showLayerSwitcher: basicConfig.showLayerSwitcher,
          showBaseMapSwitcher: basicConfig.showBaseMapSwitcher,
          showLegend: basicConfig.showLegend
        }
      }
      this.props.onComplete(properConfig)
    }
  }
  render() {
    return (
      <div className="row">
        <div className="row">
          <div className="col-xs-5 col-md-4">
            <h4>{'Navigation Tools '}</h4>
          </div>
          <div className="col-xs-7 col-md-8">
            {this.props.id &&
              <a
              style={{display:"inline-block", margin:"0px 3px 0px 3px"}}
              className="btn btn-primary btn-sm pull-right" href={this.props.urls.view}>
              View
            </a>}

            <button
              style={{display:"inline-block", margin:"0px 3px 0px 3px"}}
              className="btn btn-primary btn-sm pull-right" onClick={this.save.bind(this)}>Save</button>

            <button
              style={{display:"inline-block", margin:"0px 3px 0px 3px"}}
              className="btn btn-primary btn-sm pull-right"
              onClick={() => this.props.onPrevious()}>Previous</button>
          </div>
        </div>

        <Form ref="form" value={this.state.defaultconf} type={mapConfig}/>
      </div>
    )
  }
}