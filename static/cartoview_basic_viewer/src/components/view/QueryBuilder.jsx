import AddIcon from '@material-ui/icons/Add'
import Downloadcon from '@material-ui/icons/FileDownload'
import IconButton from '@material-ui/core/IconButton'
import PropTypes from 'prop-types'
import QueryPanel from 'Source/components/view/QueryPanel'
import React from 'react'
import RemoveIcon from '@material-ui/icons/Remove'
import Searchcon from '@material-ui/icons/Search'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({ 
    root: { 
        display: 'flex', 
        flexGrow: '1', 
        flexDirection: 'column', 
    }, 
    queryBuilderTools: { 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifyContent: 'center', 
    }, 
    queryItemsContainer: { 
        display: 'flex', 
        flexGrow: '1', 
        flexWrap: 'wrap', 
        justifyContent: 'center' 
    }, 
    item: { 
        display: 'flex', 
        alignItems: 'center', 
        flexDirection: 'column', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        margin: theme.spacing.unit, 
        border: '2px #b8b8b8 solid' 
    } 
}) 
 
class QueryBuilder extends React.Component { 
    render() { 
        const { classes, handleFilterChange, removeComponent, createQueryPanel, getFeatureTableData, filters, attributes } = this.props 
        return (<div className={classes.root}> 
            <div className={classes.queryBuilderTools}> 
                <IconButton onClick={createQueryPanel} className={classes.button} aria-label="Add"> 
                    <AddIcon /> 
                </IconButton> 
                {filters.length > 0 && <IconButton onClick={() => getFeatureTableData(undefined, undefined, undefined, false)} className={classes.button} aria-label="Search"> 
                    <Searchcon /> 
                </IconButton>} 
                {filters.length > 0 && <IconButton onClick={() => getFeatureTableData(undefined, undefined, undefined, true)} className={classes.button} aria-label="Download with Filters"> 
                    <Downloadcon /> 
                </IconButton>} 
            </div> 
            <div className={classes.queryItemsContainer}> 
                {filters.length > 0 && filters.map((filterObj, index) => <div className={classes.item} key={index}> 
                    <QueryPanel handleFilterChange={handleFilterChange(index)} filter={filterObj} attributes={attributes} /> 
                    <IconButton onClick={() => removeComponent(index)} className={classes.button} aria-label="Delete"> 
                        <RemoveIcon /> 
                    </IconButton> 
                </div>)} 
            </div> 
        </div>) 
    } 
} 
QueryBuilder.propTypes = { 
    classes: PropTypes.object.isRequired, 
    attributes: PropTypes.array.isRequired, 
    getFeatureTableData: PropTypes.func.isRequired, 
    resetTablePagination: PropTypes.func.isRequired, 
    removeComponent: PropTypes.func.isRequired, 
    createQueryPanel: PropTypes.func.isRequired, 
    filters: PropTypes.array.isRequired, 
    handleFilterChange: PropTypes.func.isRequired 
 
} 
export default withStyles(styles)(QueryBuilder)