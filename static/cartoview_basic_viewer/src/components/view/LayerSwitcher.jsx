import { FormControl, FormControlLabel, FormLabel } from 'material-ui/Form';
import List, { ListItem } from 'material-ui/List'
import Radio, { RadioGroup } from 'material-ui/Radio'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'

import Checkbox from 'material-ui/Checkbox'
// import DownloadIcon from 'material-ui-icons/FileDownload'
import DropDown from './DropDown'
import IconButton from 'material-ui/IconButton'
import ListSubheader from 'material-ui/List/ListSubheader'
import MenuIcon from 'material-ui-icons/Menu'
import { MenuItem } from 'material-ui/Menu'
import { Message } from 'Source/containers/CommonComponents'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from 'material-ui/styles'

const DragHandle = SortableHandle(() => <IconButton color="default"> <MenuIcon /></IconButton>)
const styles = theme => ({
    legendsPaper: {
        padding: theme.spacing.unit * 2,
    }
})
const LayerItem = SortableElement(({ layer, layerIndex, handleLayerVisibilty, downloadLayer, urls, handleTableLayerChange, handleFeaturesTableDrawer }) => {
    const layerName = layer.getProperties().name
    const layerTitle = layer.getProperties().title
    return (
        <ListItem disableGutters={true} className="layer-switcher-item dense">
            <DragHandle />
            <Checkbox
                checked={layer.getVisible()}
                tabIndex={-1}
                onChange={handleLayerVisibilty(layerIndex)}
                disableRipple
            />
            <Message message={layerTitle} noWrap={true} align="left" type="body1" />
            <DropDown>
                <MenuItem onClick={() => downloadLayer(layerName)}>
                    {"Download Layer"}
                </MenuItem>
                <MenuItem onClick={() => window.open(urls.layerMetaData(layerName), '_blank')}>
                    {"Metadata Details"}
                </MenuItem>
                <MenuItem onClick={() => {
                    handleTableLayerChange({ target: { value: layerName } })
                    handleFeaturesTableDrawer()
                }}>
                    {"Query/Table"}
                </MenuItem>
            </DropDown>
            {/* <IconButton color="primary" onClick={() => downloadLayer(layer.getProperties().name)} aria-label="Download">
                <DownloadIcon />
            </IconButton> */}
        </ListItem >
    )
})
const LayerList = SortableContainer(({ layers, handleLayerVisibilty, downloadLayer, urls, handleTableLayerChange, handleFeaturesTableDrawer }) => {
    return (
        <List disablePadding={true} subheader={<ListSubheader>{"Drag & Drop To Order the Layers"}</ListSubheader>}>
            {layers.map((layer, index) => (
                <LayerItem handleLayerVisibilty={handleLayerVisibilty} downloadLayer={downloadLayer} urls={urls} handleTableLayerChange={handleTableLayerChange} handleFeaturesTableDrawer={handleFeaturesTableDrawer} key={`item-${index}`} index={index} layerIndex={index} layer={layer} />
            ))}
        </List>
    )
})
const baseMapsStyles = theme => ({
    formControl: {
        margin: theme.spacing.unit * 3,
    },
    group: {
        margin: `${theme.spacing.unit}px 0`,
    },
});
class BaseMapsList extends React.Component {
    render() {
        const { baseMaps, handleBaseMapVisibilty, classes } = this.props
        let current = null
        for (let i = 0; i < baseMaps.length; i++) {
            const lyr = baseMaps[i]
            if (lyr.getVisible()) {
                current = lyr.get('id')
                break
            }
        }
        return (
            <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel component="legend">{"BaseMaps"}</FormLabel>
                <RadioGroup
                    aria-label="BaseMapSwithcer"
                    name="base_map_switcher"
                    className={classes.group}
                    value={current}
                    onChange={handleBaseMapVisibilty}
                >
                    {baseMaps.map((layer, index) => (
                        <FormControlLabel key={`item-${index}`} value={layer.get('id')} control={<Radio />} label={layer.get('title')} />
                    ))}
                </RadioGroup>
            </FormControl>
        )
    }

}
BaseMapsList.propTypes = {
    baseMaps: PropTypes.array.isRequired,
    classes: PropTypes.object.isRequired,
    handleBaseMapVisibilty: PropTypes.func.isRequired
}
export const BaseMapSwitcher = withStyles(baseMapsStyles)(BaseMapsList)
class CartoviewLayerSwitcher extends React.Component {
    render() {
        const {
            classes,
            mapLayers,
            changeLayerOrder,
            handleLayerVisibilty,
            downloadLayer,
            urls,
            handleTableLayerChange,
            handleFeaturesTableDrawer
        } = this.props
        return (
            <Paper className={classes.legendsPaper} elevation={0}>
                {mapLayers.length > 0 && <LayerList useDragHandle={true} layers={mapLayers} handleLayerVisibilty={handleLayerVisibilty} downloadLayer={downloadLayer} urls={urls} handleTableLayerChange={handleTableLayerChange} handleFeaturesTableDrawer={handleFeaturesTableDrawer} helperClass="sortable-container" onSortEnd={changeLayerOrder} />}
                {mapLayers.length == 0 && <Message message="No Layers" align="center" type="body1" />}
            </Paper>
        )
    }
}
CartoviewLayerSwitcher.propTypes = {
    urls: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    downloadLayer: PropTypes.func.isRequired,
    handleFeaturesTableDrawer: PropTypes.func.isRequired,
    handleTableLayerChange: PropTypes.func.isRequired,
    mapLayers: PropTypes.array.isRequired,
    changeLayerOrder: PropTypes.func.isRequired,
    handleLayerVisibilty: PropTypes.func.isRequired
}
export default withStyles(styles)(CartoviewLayerSwitcher)
