import { HashRouter, Route } from 'react-router-dom'
import React, { Component } from 'react'

import CartoviewDrawer from 'Source/components/view/Drawer'
import CartoviewPopup from 'Source/components/view/popup'
import FeatureTableDrawer from 'Source/components/view/FeatureTableDrawer'
import FeaturesTable from 'Source/components/view/FeaturesTable'
import GeoCodeResult from 'Source/components/view/GeoCodeResult'
import GeoCodeSearchInput from 'Source/components/view/SearchInput'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import { Loader } from 'Source/containers/CommonComponents'
import MapViewer from 'Source/components/view/MapViewer'
import MenuIcon from '@material-ui/icons/Menu'
import Paper from '@material-ui/core/Paper'
import PropTypes from 'prop-types'
import Slide from '@material-ui/core/Slide'
import Snackbar from '@material-ui/core/Snackbar'
import classnames from "classnames"
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'

const styles = theme => ({
    root: {
        height: "100%"
    },
    drawer: {
        width: "30%",
        height: "100%",
        zIndex: "1150",
        position: "fixed",
        [theme.breakpoints.down('md')]: {
            width: "90%"
        },
    },
    drawerClose: {
        width: "0%",
        height: "100%",
        zIndex: "1150",
        position: "fixed"
    },
    drawerContentClose: {
        display: 'none'
    },
    drawerContainer: {
        left: "0px !important"
    },
    DrawerBar: {
        width: '28%',
        [theme.breakpoints.down('md')]: {
            width: "88%"
        },
        zIndex: '12',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '1%',
        left: '1%',
    },
    DrawerOpenBar: {
        width: '97% !important',
        zIndex: '12',
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        top: '1%',
        left: '1%',
    }
})
const SnackMessage = (props) => {
    const { message } = props
    return <span className="element-flex" id="message-id"><Loader size={20} thickness={4} /> {message} </span>
}
SnackMessage.propTypes = {
    message: PropTypes.string.isRequired
}
export const CartoviewSnackBar = (props) => {
    const { handleClose, open, message } = props
    const messageComponent = <SnackMessage message={message} />
    return <Snackbar
        open={open}
        onClose={handleClose ? handleClose : () => { }}
        ContentProps={{
            'aria-describedby': 'message-id',
        }}
        message={messageComponent} />
}
CartoviewSnackBar.propTypes = {
    handleClose: PropTypes.func,
    open: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired
}

function Transition(props) {
    return <Slide direction="left" {...props} />
}
class ContentGrid extends Component {
    geoCodingProps = () => {
        const { childrenProps } = this.props
        const props = {
            searchText: childrenProps.searchText,
            geocodeSearchLoading: childrenProps.geocodeSearchLoading,
            geocodeSearch: childrenProps.geocodeSearch,
            resetGeocoding: childrenProps.resetGeocoding,
            geocodingResult: childrenProps.geocodingResult,
            handleGeocodingChange: childrenProps.handleGeocodingChange,
        }
        return props
    }
    getDrawerProps = () => {
        const { childrenProps } = this.props
        return {
            setThumbnail: childrenProps.setThumbnail,
            thumbnailSaving: childrenProps.thumbnailSaving,
            map: childrenProps.map,
            resetTablePagination: childrenProps.resetTablePagination,
            handleFeaturesTableDrawer: childrenProps.handleFeaturesTableDrawer,
            exportMap: childrenProps.exportMap,
            config: childrenProps.config,
            handleLayerVisibilty: childrenProps.handleLayerVisibilty,
            changeLayerOrder: childrenProps.changeLayerOrder,
            mapLayers: childrenProps.mapLayers,
            handleLayerOpacity: childrenProps.handleLayerOpacity,
            downloadLayer: childrenProps.downloadLayer,
            urls: childrenProps.urls,
            createLegends: childrenProps.createLegends,
            handleTableLayerChange: childrenProps.handleTableLayerChange,
            baseMaps: childrenProps.baseMaps,
            handleBaseMapVisibilty: childrenProps.handleBaseMapVisibilty,
            handlePrintModal: childrenProps.handlePrintModal
        }

    }
    getFeatureTableDrawerProps = () => {
        const { childrenProps } = this.props
        return {
            attributes: childrenProps.layerAttributes,
            wfsService: childrenProps.wfsService,
            resetTablePagination: childrenProps.resetTablePagination,
            combinationType: childrenProps.combinationType,
            handleCombinationType: childrenProps.handleCombinationType,
            getFeatureTableData: childrenProps.getFeatureTableData,
            tableLayer: childrenProps.tableLayer,
            handleTableLayerChange: childrenProps.handleTableLayerChange,
            loading: childrenProps.featuresIsLoading,
            mapLayers: childrenProps.mapLayers,
            hanldeDrawerOpen: childrenProps.handleFeaturesTableDrawer,
            drawerOpen: childrenProps.featuresTableOpen,
            createQueryPanel: childrenProps.createQueryPanel,
            removeComponent: childrenProps.removeComponent,
            filters: childrenProps.filters,
            handleFilterChange: childrenProps.handleFilterChange,
            resetQuery: childrenProps.resetQuery,
        }
    }
    getFeatureTableProps = () => {
        const { childrenProps } = this.props
        return {
            handlePageChange: childrenProps.handlePageChange,
            handleRowsPerPage: childrenProps.handleRowsPerPage,
            page: childrenProps.page,
            rowsPerPage: childrenProps.rowsPerPage,
            getFeatureTableData: childrenProps.getFeatureTableData,
            totalFeatures: childrenProps.totalFeatures,
            searchEnabled: childrenProps.searchEnabled,
            resetFeatureCollection: childrenProps.resetFeatureCollection,
            addStyleToFeature: childrenProps.addStyleToFeature,
            loading: childrenProps.featuresIsLoading,
            zoomToFeature: childrenProps.zoomToFeature,
            features: childrenProps.features,
            resetQuery: childrenProps.resetQuery
        }
    }
    render() {
        const { classes, childrenProps } = this.props
        return (
            <div className={classes.root}>
                <div className={classnames({ [classes.drawer]: childrenProps.drawerOpen ? true : false, [classes.drawerClose]: childrenProps.drawerOpen ? false : true })}>
                    <Paper className={classnames(classes.DrawerBar, { [classes.DrawerOpenBar]: childrenProps.drawerOpen })}>
                        <div className="element-flex ">
                            <IconButton onTouchTap={childrenProps.toggleDrawer} color="default" aria-label="Open Menu">
                                <MenuIcon />
                            </IconButton>
                            <GeoCodeSearchInput config={this.geoCodingProps()} />
                        </div>
                        {!childrenProps.geocodeSearchLoading && childrenProps.geocodingResult.length > 0 &&
                            <GeoCodeResult
                                resetGeocoding={childrenProps.resetGeocoding}
                                action={childrenProps.zoomToExtent}
                                geocodingResult={childrenProps.geocodingResult}
                                geocodeSearchLoading={childrenProps.geocodeSearchLoading}
                                boundlessGeoCodingEnabled={childrenProps.config.boundlessGeoCodingEnabled}
                            />}                    </Paper>
                    <Transition in={childrenProps.drawerOpen} direction={"right"}>
                        <CartoviewDrawer {...this.getDrawerProps()} className={classnames({ [classes.drawerContentClose]: !childrenProps.drawerOpen })} />
                    </Transition>
                </div>
                <Grid className={classes.root} container alignItems={"stretch"} spacing={0}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <HashRouter>
                            <Route exact path="/:x0?/:y0?/:x1?/:y1?" render={(props) => <MapViewer loading={childrenProps.mapIsLoading} {...props} enableHistory={childrenProps.config.enableHistory} map={childrenProps.map} />} />
                        </HashRouter>
                        {childrenProps.mapLayers.length > 0 && childrenProps.config.enableFeatureTable && <FeatureTableDrawer {...this.getFeatureTableDrawerProps()}>
                            <FeaturesTable {...this.getFeatureTableProps()} />
                        </FeatureTableDrawer>}
                        <CartoviewPopup {...childrenProps} />
                    </Grid>
                </Grid>
                <CartoviewSnackBar open={childrenProps.featureIdentifyLoading} message={"Searching For Features at this Point"} />
            </div>
        )
    }
}
ContentGrid.propTypes = {
    childrenProps: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    width: PropTypes.string,
}
export default compose(withStyles(styles), withWidth())(ContentGrid)