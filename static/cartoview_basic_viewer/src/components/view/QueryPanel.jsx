import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import PropTypes from 'prop-types'
import React from 'react'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'

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
    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
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
        const { attributes, filter } = this.props
        const { attribute } = filter
        const attrType = this.getAttributeType(attributes, attribute)
        const localType = INITIAL_TYPE_MAPPING[attrType] || "text"
        const supportedFilters = TYPE_FILTERS_MAPPING[localType] || []
        return supportedFilters
    }
    getValueFieldProps = () => {
        const { attributes, filter } = this.props
        const { attribute } = filter
        const attrType = this.getAttributeType(attributes, attribute)
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
        const { attributes, classes, handleFilterChange, filter } = this.props
        const { attribute, value, op, start, end } = filter
        const attrType = this.getAttributeType(attributes, attribute)
        const localType = INITIAL_TYPE_MAPPING[attrType]
        let component = <TextField {...this.getValueFieldProps()}
            id="value"
            required
            error={value ? false : true}
            label="Value"
            InputProps={{
                name: 'value',
            }}

            className={classes.textField}
            value={value}
            onChange={handleFilterChange}
            margin="normal"
        />
        if ((localType === "date" || localType === "datetime") && op === "DURING") {
            component = [
                <TextField key="start" {...this.getValueFieldProps()}
                    id="start"
                    required
                    error={start ? false : true}
                    label="start"
                    InputProps={{
                        name: 'start',
                    }}
                    className={classes.textField}
                    value={start}
                    onChange={handleFilterChange}
                    margin="normal"
                />,
                <TextField key="end"  {...this.getValueFieldProps()}
                    id="end"
                    required
                    error={end ? false : true}
                    label="end"
                    InputProps={{
                        name: 'end',
                    }}

                    className={classes.textField}
                    value={end}
                    onChange={handleFilterChange}
                    margin="normal"
                />
            ]
        }
        return component
    }

    render() {
        const { attributes, classes, handleFilterChange, filter } = this.props
        return (
            <form className={classes.form} onSubmit={this.handleSubmit} autoComplete="off">
                <FormControl className={classes.formControl} error={filter.attribute ? false : true}>
                    <InputLabel htmlFor="layer-select">{"Attribute"}</InputLabel>
                    <Select
                        value={filter.attribute}
                        onChange={handleFilterChange}
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
                <FormControl className={classes.formControl} error={filter.op ? false : true}>
                    <InputLabel htmlFor="layer-select">{"Operation"}</InputLabel>
                    <Select
                        value={filter.op}
                        onChange={handleFilterChange}
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
    filter: PropTypes.object.isRequired,
    handleFilterChange: PropTypes.func.isRequired,

}
export default withStyles(styles)(QueryPanel)