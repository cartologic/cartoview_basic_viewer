import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'

import CameraIcon from 'material-ui-icons/PhotoCamera'
import CartoviewAbout from 'Source/components/view/About'
import CartoviewBookmarks from 'Source/components/view/Bookmarks'
import CartoviewLayerSwitcher from 'Source/components/view/LayerSwitcher'
import CartoviewLegends from 'Source/components/view/Legends'
import CollapsibleListItem from 'Source/components/view/CollapsibleItem'
import HomeIcon from 'material-ui-icons/Home'
import ImageIcon from 'material-ui-icons/Image'
import InfoIcons from 'material-ui-icons/Info'
import LayersIcons from 'material-ui-icons/Layers'
import LocationIcon from 'material-ui-icons/LocationOn'
import NavBar from 'Source/components/view/NavBar.jsx'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import TableIcon from 'material-ui-icons/GridOn'
import classnames from 'classnames'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
    root: {
        height: "100%",
        overflowY: 'overlay'
    },
    drawerPaper: {
        padding: theme.spacing.unit,
    }
})
class CartoviewDrawer extends React.Component {
    state = {
        about: false
    }
    handleAboutChange = () => {
        const { about } = this.state
        this.setState({ about: !about })
    }
    render() {
        const {
            classes, className, legends, urls, mapLayers, changeLayerOrder,
            handleLayerVisibilty,
            config,
            exportMap,
            handleFeaturesTableDrawer,
            map
        } = this.props
        const { about } = this.state
        return (
            <Paper elevation={6} className={classnames(classes.root, className)}>
                <NavBar config={config} />
                <Paper className={classes.drawerPaper} elevation={0}>
                    <List>
                        <ListItem onTouchTap={() => window.location.href = urls.appInstancesPage} button>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>
                        <ListItem onTouchTap={this.handleAboutChange} button>
                            <ListItemIcon>
                                <InfoIcons />
                            </ListItemIcon>
                            <ListItemText primary="About" />
                        </ListItem>
                        {config.showExportMap && <ListItem onTouchTap={exportMap} button>
                            <ListItemIcon>
                                <CameraIcon />
                            </ListItemIcon>
                            <ListItemText primary="Export Map" />
                        </ListItem>}
                        {config.enableFeatureTable && <ListItem onTouchTap={handleFeaturesTableDrawer} button>
                            <ListItemIcon>
                                <TableIcon />
                            </ListItemIcon>
                            <ListItemText primary="Feature Table" />
                        </ListItem>}

                        {config.bookmarks && <CollapsibleListItem open={false} title="Bookmarks" icon={<LocationIcon />} >
                            <CartoviewBookmarks map={map} bookmarks={config.bookmarks} />
                        </CollapsibleListItem>}
                        {config.showLayerSwitcher && <CollapsibleListItem open={false} title="Layers" icon={<LayersIcons />} >
                            <CartoviewLayerSwitcher handleLayerVisibilty={handleLayerVisibilty} changeLayerOrder={changeLayerOrder} mapLayers={mapLayers} />
                        </CollapsibleListItem>}
                        {config.showLegend && <CollapsibleListItem open={false} title="Legend" icon={<ImageIcon />} >
                            <CartoviewLegends legends={legends} />
                        </CollapsibleListItem>}

                        <CartoviewAbout open={about} title={config.formTitle} abstract={config.formAbstract} close={this.handleAboutChange} />
                    </List>
                </Paper>
            </Paper >
        )
    }
}
CartoviewDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
    changeLayerOrder: PropTypes.func.isRequired,
    legends: PropTypes.array.isRequired,
    urls: PropTypes.object.isRequired,
    mapLayers: PropTypes.array.isRequired,
    handleLayerVisibilty: PropTypes.func.isRequired,
    exportMap: PropTypes.func.isRequired,
    handleFeaturesTableDrawer: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    map: PropTypes.object.isRequired
}
export default withStyles(styles)(CartoviewDrawer)
