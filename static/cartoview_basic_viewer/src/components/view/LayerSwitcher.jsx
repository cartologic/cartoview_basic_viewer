import 'react-input-range/lib/css/index.css'

import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'

import Checkbox from '@material-ui/core/Checkbox'
import DragHandleIcon from '@material-ui/icons/DragHandle'
import DropDown from './DropDown'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import InputRange from 'react-input-range'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListSubheader from '@material-ui/core/ListSubheader'
import MenuItem from '@material-ui/core/MenuItem'
import { Message } from 'Source/containers/CommonComponents'
import Paper from '@material-ui/core/Paper'
import PropTypes from 'prop-types'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import React from 'react'
import URLS from 'cartoview-sdk/urls/urls'
import { copyToClipboard } from 'cartoview-sdk/utils/utils'
import { withStyles } from '@material-ui/core/styles'

const DragHandle = SortableHandle(() => <DragHandleIcon />)
const styles = theme => ({
    legendsPaper: {
        padding: theme.spacing.unit * 2,
    }
})
const LayerItem = SortableElement(({ layer, layerIndex, handleLayerVisibilty, downloadLayer, urls, handleTableLayerChange, handleFeaturesTableDrawer, handleLayerOpacity }) => {
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
            <div className="element-flex element-column title-noWrap">
                <Message message={layerTitle} noWrap={true} align="left" type="body1" />
                <InputRange
                    minValue={0}
                    maxValue={1}
                    step={.1}
                    value={layer.getOpacity()}
                    onChange={handleLayerOpacity(layerIndex)}
                />
            </div>
            <DropDown>
                <MenuItem onTouchTap={() => downloadLayer(layerName)}>
                    {"Download Layer"}
                </MenuItem>
                <MenuItem onTouchTap={() => window.open(urls.layerMetaData(layerName), '_blank')}>
                    {"Metadata Details"}
                </MenuItem>
                <MenuItem onTouchTap={() => {
                    let urlHelper = new URLS(urls.proxy)
                    let url = urlHelper.getParamterizedURL(urls.wfsURL, { service: 'wfs', version: '2.0.0', request: 'GetFeature', typeNames: layer.get('name'), outputFormat: 'json' })
                    copyToClipboard(url).then(result => alert("WFS URL Copied Successfully"))
                }}>
                    {"Copy WFS URL"}
                </MenuItem>
                <MenuItem onTouchTap={() => {
                    handleTableLayerChange({ target: { value: layerName } })
                    handleFeaturesTableDrawer()
                }}>
                    {"Query/Table"}
                </MenuItem>
            </DropDown>
        </ListItem >
    )
})
const LayerList = SortableContainer(({ layers, handleLayerVisibilty, downloadLayer, urls, handleTableLayerChange, handleFeaturesTableDrawer, handleLayerOpacity }) => {
    return (
        <List disablePadding={true} subheader={<ListSubheader>{"Drag & Drop To Order the Layers"}</ListSubheader>}>
            {layers.map((layer, index) => (
                <LayerItem handleLayerVisibilty={handleLayerVisibilty} downloadLayer={downloadLayer} urls={urls} handleTableLayerChange={handleTableLayerChange} handleFeaturesTableDrawer={handleFeaturesTableDrawer} handleLayerOpacity={handleLayerOpacity} key={`item-${index}`} index={index} layerIndex={index} layer={layer} />
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
})
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
            handleLayerOpacity,
            handleFeaturesTableDrawer
        } = this.props
        return (
            <Paper className={classes.legendsPaper} elevation={0}>
                {mapLayers.length > 0 && <LayerList useDragHandle={true} layers={mapLayers} handleLayerVisibilty={handleLayerVisibilty} downloadLayer={downloadLayer} urls={urls} handleTableLayerChange={handleTableLayerChange} handleFeaturesTableDrawer={handleFeaturesTableDrawer} handleLayerOpacity={handleLayerOpacity} helperClass="sortable-container" onSortEnd={changeLayerOrder} />}
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
    handleLayerOpacity: PropTypes.func.isRequired,
    handleTableLayerChange: PropTypes.func.isRequired,
    mapLayers: PropTypes.array.isRequired,
    changeLayerOrder: PropTypes.func.isRequired,
    handleLayerVisibilty: PropTypes.func.isRequired
}
export default withStyles(styles)(CartoviewLayerSwitcher)
