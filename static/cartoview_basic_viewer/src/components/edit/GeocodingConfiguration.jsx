import PropTypes from 'prop-types'
import React from 'react'
import { geocodingFormSchema } from 'Source/containers/forms'
import { getPropertyFromConfig } from 'Source/containers/staticMethods'
import t from 'tcomb-form'
// import { geocodinglFormSchema } from '../../containers/forms';
const Form = t.form.Form
export default class GeocodingConfiguration extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: this.getFormValue(this.props)
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        const { errors } = this.props
        if (nextProps.errors !== errors) {
            return false
        }
        return true
    }
    getComponentValue = () => {
        const value = this.form.getValue()
        return value
    }
    // componentWillReceiveProps(nextProps) {
    //     const { selectedMap, config,instanceId } = this.props
    //     if (((selectedMap !== nextProps.selectedMap) || config)&& !instanceId) {
    //         this.setState({ value: this.getFormValue(nextProps) })
    //     }
    // }
    onChange = (newValue) => {
        this.setState({ value: newValue })
    }
    getFormValue = (props) => {
        const { config } = props
        const value = {
            boundlessGeoCodingEnabled: config ? config.boundlessGeoCodingEnabled : false,
            geocodingKey: config ? config.geocodingKey : null,
        }
        return value
    }
    getFormOptions = () => {
        const options = {
            fields: {
                boundlessGeoCodingEnabled: {
                    label: "Enable Boundless GeoCoding Service"
                },
                geocodingKey: {
                    label: "Key",
                    disabled: !this.state.value.boundlessGeoCodingEnabled ? true : false,
                },
            }
        }
        return options
    }
    render() {
        return (
            <div>
                <h3>{"Boundless Geocoding"}</h3>
                <Form
                    ref={(form) => this.form = form}
                    value={this.state.value}
                    type={geocodingFormSchema()}
                    onChange={this.onChange} />
            </div>
        )
    }
}
GeocodingConfiguration.propTypes = {
    config: PropTypes.object,
    errors: PropTypes.array.isRequired,
    instanceId:PropTypes.number
}