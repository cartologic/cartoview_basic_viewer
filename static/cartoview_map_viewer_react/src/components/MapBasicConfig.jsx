import React, {Component} from 'react';
import t from 'tcomb-form';


const Access = t.enums({
  public: 'Public',
  private: 'Private (only me)',
  // others: 'Other Users'
});
const mapConfig = t.struct({
  title: t.String,
  abstract: t.String,
  access: Access,
  keywords: t.maybe(t.String),
});
const options = {
  fields: {
    title: {
      label: "App Title"
    },
    access: {
      factory: t.form.Radio
    },
    keywords: {
      help: "Tip: Enter keywords as a comma separated strings Ex: 'united_states, usa'"
    },
  }
};
const Form = t.form.Form;


export default class MapBasicConfig extends Component {
  constructor(props) {
    super(props)
    this.state = {
      defaultConfig: {
        title: this.props.instance.title || "No Title Provided",
        abstract: this.props.instance.abstract || "No Abstract Provided",
        access: 'private'
      }
    }
  }


  save() {
    var basicConfig = this.refs.form.getValue();
    if (basicConfig) {
      // console.log("basicConfig:", basicConfig);
      const properConfig = {
        title: basicConfig.title,
        abstract: basicConfig.abstract,
        access:basicConfig.access,
        keywords:basicConfig.keywords
      }
      this.props.onComplete(properConfig)
    }
  }





  render() {
    return (
      <div className="row">
        <div className="row">
          <div className="col-xs-6 col-md-8">
            <h4>{'General '}</h4>
          </div>

          <div className="col-xs-6 col-md-4">
            <div className="btn-group" style={{float: "right"}}>
              <button type='button' className="btn btn-primary"
                onClick={() => this.props.onPrevious()}>Previous</button>

              <button type='button' className="btn btn-primary"
                onClick={this.save.bind(this)}>Next</button>
            </div>
          </div>


        </div>
        <hr></hr>

        <Form
          ref="form"
          value={this.state.defaultConfig}
          type={mapConfig}
          options={options} />
      </div>
    )
  }
}
