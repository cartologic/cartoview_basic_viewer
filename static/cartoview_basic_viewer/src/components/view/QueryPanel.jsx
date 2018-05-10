import { FormControl, } from 'material-ui/Form'
import { InputLabel } from 'material-ui/Input'
import { MenuItem } from 'material-ui/Menu'
import PropTypes from 'prop-types'
import React from 'react'
import Select from 'material-ui/Select'
import TextField from 'material-ui/TextField'
import { withStyles } from 'material-ui/styles'
//TODO: check if more types supported by  geoserver
const INITIAL_TYPE_MAPPING = {
    string: "text",
    double: "number",
    int: "number",
    number: "number",
    long: "number",
    boolean: "checkbox",
    "date-time": "datetime",
    date: "date",
}
const TYPE_FILTERS_MAPPING = {
    "text": ["Like", "=", "!="],
    "number": ["=", "<=", "<", "!=", ">", ">="],
    "datetime": ["=", "!=", "During"],
    "date": ["=", "!=", "During"],
}
const FILTERS = {
    "Like": "LIKE",
    "=": "=",
    "<=": "<=",
    "<": "<",
    "!=": "<>",
    ">": ">",
    ">=": ">=",
    "During": "DURING"

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
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    form: {
        display: 'flex',
        flexDirection: 'column'
        // [theme.breakpoints.down('md')]: {
        //     display: 'flex',
        //     flexDirection: 'column'
        // },

    }
})
class QueryPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            op: "",
            value: "",
            start: new Date().toISOString(),
            end: new Date().toISOString(),
            attribute: ""
        }
    }
    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.attributes !== this.props.attributes || nextState !== this.state) {
            return true
        }
        return false
    }
    resetForm = () => {
        this.setState({ value: "", op: "", attribute: "" })
    }
    handleSubmit = (e) => {
        e.preventDefault()
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
    getSupportedFilters = () => {
        const { attributes } = this.props
        const attrType = this.getAttributeType(attributes, this.state.attribute)
        const localType = INITIAL_TYPE_MAPPING[attrType] || "text"
        const supportedFilters = TYPE_FILTERS_MAPPING[localType] || []
        return supportedFilters
    }
    componentWillReceiveProps(nextProps) {
        const { attributes } = this.props
        if (attributes !== nextProps.attributes) {
            this.resetForm()
        }
    }
    isValid = () => {
        const { value, attribute, op, start, end } = this.state
        let valid = false
        if (op !== "DURING") {
            if (value && attribute && op) {
                valid = true
            }
        } else {
            if (start && end && attribute && op) {
                valid = true
            }
        }
        return valid
    }
    getFilterObj = () => {
        const { attributes } = this.props
        const attrType = this.getAttributeType(attributes, this.state.attribute)
        const localType = INITIAL_TYPE_MAPPING[attrType]
        const { value, attribute, op, start, end } = this.state
        this.formSubmit.click()
        if (this.isValid()) {
            if (op === "DURING") {
                return {
                    attribute, operator: op, value,
                    start: new Date(start).toISOString(),
                    end: new Date(end).toISOString()
                }
            }
            if (localType === "date" || localType === "datetime") {
                return { attribute, operator: op, value: new Date(start).toISOString() }
            }
            return { attribute, operator: op, value }
        }
    }
    getValueFieldProps = () => {
        const { attributes } = this.props
        const attrType = this.getAttributeType(attributes, this.state.attribute)
        const localType = INITIAL_TYPE_MAPPING[attrType]
        let props = {}
        if (localType === "date") {
            props.type = "date"
        } else if (localType === "datetime") {
            props.type = "datetime-local"
        }
        return props
    }
    getTextInput = () => {
        const { attributes, classes } = this.props
        const attrType = this.getAttributeType(attributes, this.state.attribute)
        const localType = INITIAL_TYPE_MAPPING[attrType]
        let component = <TextField {...this.getValueFieldProps()}
            id="value"
            required
            error={this.state.value ? false : true}
            label="Value"
            InputProps={{
                name: 'value',
            }}

            className={classes.textField}
            value={this.state.value}
            onChange={this.handleChange}
            margin="normal"
        />
        if ((localType === "date" || localType === "datetime") && this.state.op === "DURING") {
            component = [
                <TextField key="start" {...this.getValueFieldProps()}
                    id="start"
                    required
                    error={this.state.start ? false : true}
                    label="start"
                    InputProps={{
                        name: 'start',
                    }}
                    className={classes.textField}
                    value={this.state.start}
                    onChange={this.handleChange}
                    margin="normal"
                />,
                <TextField key="end"  {...this.getValueFieldProps()}
                    id="end"
                    required
                    error={this.state.end ? false : true}
                    label="end"
                    InputProps={{
                        name: 'end',
                    }}

                    className={classes.textField}
                    value={this.state.end}
                    onChange={this.handleChange}
                    margin="normal"
                />
            ]
        }
        return component
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
                        autoWidth
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
                        autoWidth
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {this.getSupportedFilters().map((property, index) => {
                            return <MenuItem key={index} value={FILTERS[property]}>{property}</MenuItem>
                        })}
                    </Select>
                </FormControl>
                {this.getTextInput()}
                <button ref={(node) => this.formSubmit = node} type="submit" hidden></button>
            </form>

        )
    }
}
QueryPanel.propTypes = {
    classes: PropTypes.object.isRequired,
    attributes: PropTypes.array.isRequired,
    getFeatureTableData: PropTypes.func.isRequired,
    resetTablePagination: PropTypes.func.isRequired,

}
export default withStyles(styles)(QueryPanel)