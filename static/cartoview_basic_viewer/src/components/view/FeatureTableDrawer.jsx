import React, { Component } from 'react'

import CloseIcon from '@material-ui/icons/Close'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton'
import InputLabel from '@material-ui/core/InputLabel'
import { Loader } from 'Source/containers/CommonComponents'
import Paper from '@material-ui/core/Paper'
import PropTypes from 'prop-types'
import QueryBuilder from 'Source/components/view/QueryBuilder'
import Select from '@material-ui/core/Select'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    drawerPaper: {
        height: '40%',
        width: '100%',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    expansion: {
        padding: 0
    },
    closeButton: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    layerSelector: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    queryPanel: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    button: {
        margin: theme.spacing.unit,
    },
    query: {
        width: '100%',
        height: '100%',
        display: 'block',
    },
    drawerHeader: theme.mixins.toolbar
})
class Sidenav extends Component {
    render() {
        const { drawerOpen,
            classes,
            resetTablePagination,
            hanldeDrawerOpen,
            mapLayers,
            children,
            createQueryPanel,
            removeComponent,
            filters,
            loading,
            combinationType,
            handleCombinationType,
            tableLayer,
            handleTableLayerChange,
            getFeatureTableData,
            handleFilterChange,
            resetQuery,
            attributes } = this.props
        return (
            <Drawer
                variant="persistent"
                classes={{
                    paper: classes.drawerPaper,
                }}
                open={drawerOpen}
                anchor={'bottom'}
            >
                <IconButton onClick={hanldeDrawerOpen} color="primary" className={classes.button} aria-label="Close">
                    <CloseIcon />
                </IconButton>
                <Divider />
                <div>
                    <Paper elevation={0} className={classes.query}>
                        <div className={classes.layerSelector}>
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
                            <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="filters-match-select">{"Filters Matching"}</InputLabel>
                                <Select
                                    native
                                    onChange={handleCombinationType}
                                    value={combinationType}
                                    inputProps={{
                                        id: 'filters-match-select',
                                    }}
                                >
                                    <option value={'any'}>{"Any"}</option>
                                    <option value={'all'}>{"All"}</option>
                                </Select>
                            </FormControl>
                        </div>
                        <div className={classes.queryPanel}>
                            <QueryBuilder handleFilterChange={handleFilterChange} filters={filters} createQueryPanel={createQueryPanel} removeComponent={removeComponent} resetTablePagination={resetTablePagination} attributes={attributes} getFeatureTableData={getFeatureTableData}
                                resetQuery={resetQuery} />
                        </div>
                        {children}
                    </Paper>
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
    resetTablePagination: PropTypes.func.isRequired,
    children: PropTypes.node,
    mapLayers: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    tableLayer: PropTypes.string.isRequired,
    attributes: PropTypes.array.isRequired,
    handleTableLayerChange: PropTypes.func.isRequired,
    getFeatureTableData: PropTypes.func.isRequired,
    createQueryPanel: PropTypes.func.isRequired,
    removeComponent: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    handleFilterChange: PropTypes.func.isRequired,
    resetQuery: PropTypes.func.isRequired,
    combinationType: PropTypes.string.isRequired,
    handleCombinationType: PropTypes.func.isRequired,
}

export default withStyles(styles)(Sidenav)