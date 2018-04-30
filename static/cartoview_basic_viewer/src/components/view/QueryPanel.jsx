import Input, { InputLabel } from 'material-ui/Input'

import { FormControl, } from 'material-ui/Form'
import { MenuItem } from 'material-ui/Menu'
import PropTypes from 'prop-types'
import React from 'react'
import Select from 'material-ui/Select'
import { withStyles } from 'material-ui/styles'

const StringFilters = ["Like", "=", "<>"]
const FILTERS = {
    "Like": "LIKE",
    "=": "=",
    "<=": "<=",
    "<": "<",
    "<>": "<>",
    ">": ">",
    ">=": ">=",

}
const styles = theme => ({
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    form: {
        [theme.breakpoints.down('md')]: {
            display: 'flex',
            flexDirection: 'column'
        },

    }
})
class QueryPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            op: "",
            value: "",
            attribute: ""
        }
    }
    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }
    handleSubmit = (e) => {
        e.preventDefault()
        const { handleCQLFilterChange } = this.props
        const { attribute, op, value } = this.state
        if (attribute && op && value) {
            handleCQLFilterChange({ attribute: attribute, operator: op, value: value })
        }
    }
    getAttributeType = (attributes = [], attributeName) => {
        let attributeType = null
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i]
            if (attr.name === attributeName) {
                attributeType = attr.type.split(":").pop()
                break
            }
        }
        return attributeType
    }

    render() {
        const { attributes, classes } = this.props
        return (
            <form className={classes.form} onSubmit={this.handleSubmit} autoComplete="off">
                <FormControl className={classes.formControl} error={this.state.attribute ? false : true}>
                    <InputLabel htmlFor="layer-select">{"Attribute"}</InputLabel>
                    <Select
                        value={this.state.attribute}
                        onChange={this.handleChange}
                        inputProps={{
                            name: 'attribute',
                            id: 'attribute-select',
                        }}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {attributes.map((attr, index) => {
                            return <MenuItem key={index} value={attr.name}>{attr.name}</MenuItem>
                        })}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl} error={this.state.op ? false : true}>
                    <InputLabel htmlFor="layer-select">{"Operation"}</InputLabel>
                    <Select
                        value={this.state.op}
                        onChange={this.handleChange}
                        inputProps={{
                            name: 'op',
                            id: 'op-select',
                        }}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {Object.keys(FILTERS).map((property, index) => {
                            const attrType = this.getAttributeType(attributes, this.state.attribute)
                            if (attrType === "string" && StringFilters.includes(property)) {
                                return <MenuItem key={index} value={FILTERS[property]}>{property}</MenuItem>
                            } else if (attrType !== "string" && property != "Like") {
                                return <MenuItem key={index} value={FILTERS[property]}>{property}</MenuItem>
                            }


                        })}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl} error={this.state.value ? false : true} >
                    <InputLabel htmlFor="attr-value">Value</InputLabel>
                    <Input id="attr-value" value={this.state.value} name="value" onChange={this.handleChange} />
                </FormControl>
            </form>

        )
    }
}
QueryPanel.propTypes = {
    classes: PropTypes.object.isRequired,
    attributes: PropTypes.array.isRequired,
    handleCQLFilterChange: PropTypes.func.isRequired,

}
export default withStyles(styles)(QueryPanel)