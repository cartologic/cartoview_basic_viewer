import IconButton from 'material-ui/IconButton'
import InfoIcon from 'material-ui-icons/Info'
import { InputAdornment } from 'material-ui/Input'
import PropTypes from 'prop-types'
import React from 'react'
import SearchIcon from 'material-ui-icons/Search'
import TextField from 'material-ui/TextField'

const QueryPanel = (props) => {
    const { cqlFilter, handleCQLFilterChange, getTableData } = props
    const handleKeyPress = (event) => {
        const { getTableData } = props
        if (event.key == 'Enter') {
            getTableData({ pageSize: 10, sorted: [], page: 0, filtered: [] }, {})
        }
    }
    return (
        <TextField
            label="CQL Filter"
            value={cqlFilter}
            onChange={handleCQLFilterChange}
            placeholder="Enter CQL Filter"
            fullWidth
            InputProps={{
                endAdornment: <InputAdornment position="end">
                    <IconButton
                        onClick={() => getTableData({ pageSize: 10, sorted: [], page: 0, filtered: [] }, {})}
                    >
                        <SearchIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => window.open("http://docs.geoserver.org/latest/en/user/tutorials/cql/cql_tutorial.html", '_blank')}
                    >
                        <InfoIcon />
                    </IconButton>
                </InputAdornment>,
                onKeyPress: handleKeyPress
            }}

        />

    )
}
QueryPanel.propTypes = {
    cqlFilter: PropTypes.string.isRequired,
    handleCQLFilterChange: PropTypes.func.isRequired,
    getTableData: PropTypes.func.isRequired,

}
export default QueryPanel
