import { Loader, Message } from 'Source/containers/CommonComponents'
import React, { Component } from 'react'

import CloseIcon from '@material-ui/icons/Close'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton'
import InputLabel from '@material-ui/core/InputLabel'
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
            queryComponents,
            loading,
            combinationType,
            handleCombinationType,
            tableLayer,
            handleTableLayerChange,
            getFeatureTableData,
            createQueryRef,
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
                    <ExpansionPanel className={classes.expansion}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Message align="left" type={"subheading"} message="Query & Layers" />
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.expansion}>
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
                                    <QueryBuilder createQueryRef={createQueryRef} components={queryComponents} createQueryPanel={createQueryPanel} removeComponent={removeComponent} resetTablePagination={resetTablePagination} attributes={attributes} getFeatureTableData={getFeatureTableData}
                                        resetQuery={resetQuery} />
                                </div>
                            </Paper>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel defaultExpanded={true} className={classes.expansion}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Message type={"subheading"} align="left" message="Feature Table" />
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.expansion}>
                            {children}
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
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
    queryComponents: PropTypes.array.isRequired,
    createQueryRef: PropTypes.func.isRequired,
    resetQuery: PropTypes.func.isRequired,
    combinationType: PropTypes.string.isRequired,
    handleCombinationType: PropTypes.func.isRequired,
}

export default withStyles(styles)(Sidenav)