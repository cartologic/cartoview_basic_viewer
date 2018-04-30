import React, { Component } from 'react'

import CloseIcon from 'material-ui-icons/Close'
import Divider from 'material-ui/Divider'
import Drawer from 'material-ui/Drawer'
import { FormControl, } from 'material-ui/Form'
import IconButton from 'material-ui/IconButton'
import { InputLabel } from 'material-ui/Input'
import { Loader } from 'Source/containers/CommonComponents'
import PropTypes from 'prop-types'
import QueryPanel from 'Source/components/view/QueryPanel'
import Select from 'material-ui/Select'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
    drawerPaper: {
        position: 'fixed',
        height: '40%',
        width: '100%',
        display: "flex",
        flexDirection: 'column'
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    closeButton: {
        gridColumn: 3,
        display: 'flex',
        justifyContent: 'flex-end',
    },
    queryPanel: {
        gridColumn: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        margin: theme.spacing.unit,
    },
    drawerHeader: theme.mixins.toolbar
})
class Sidenav extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        const { drawerOpen, classes, hanldeDrawerOpen, mapLayers, children, loading, tableLayer, handleTableLayerChange, handleCQLFilterChange, attributes, getTableData } = this.props
        return (
            <Drawer
                variant="persistent"
                classes={{
                    paper: classes.drawerPaper,
                }}
                open={drawerOpen}
                anchor={'bottom'}
            >
                <Divider />
                <div className="table-drawer-head ">
                    <div >
                        <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="layer-select">{"Layer"}</InputLabel>
                            <Select
                                native
                                onChange={handleTableLayerChange}
                                value={tableLayer}

                                inputProps={{
                                    id: 'layer-select',
                                }}
                            >
                                {mapLayers.map((layer, index) => <option key={index} value={layer.get('name')}>{layer.get('name')}</option>)}
                            </Select>
                        </FormControl>
                    </div>
                    <div className={classes.queryPanel}>
                        <QueryPanel attributes={attributes} handleCQLFilterChange={handleCQLFilterChange} />
                    </div>
                    <div className={classes.closeButton}>
                        <IconButton onClick={hanldeDrawerOpen} color="primary" className={classes.button} aria-label="Close">
                            <CloseIcon />
                        </IconButton>
                    </div>
                </div>
                <Divider />
                <div className="element-flex">
                    {children}
                </div>
                {loading && <Loader />}


            </Drawer>
        )

    }

}
Sidenav.propTypes = {
    classes: PropTypes.object.isRequired,
    drawerOpen: PropTypes.bool.isRequired,
    hanldeDrawerOpen: PropTypes.func.isRequired,
    children: PropTypes.node,
    mapLayers: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    tableLayer: PropTypes.string.isRequired,
    attributes: PropTypes.array.isRequired,
    handleTableLayerChange: PropTypes.func.isRequired,
    handleCQLFilterChange: PropTypes.func.isRequired,
}

export default withStyles(styles)(Sidenav)