import { FormControl, FormControlLabel, FormLabel } from 'material-ui/Form';
import List, { ListItem } from 'material-ui/List'
import Radio, { RadioGroup } from 'material-ui/Radio';
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

import Checkbox from 'material-ui/Checkbox'
import ListSubheader from 'material-ui/List/ListSubheader'
import { Message } from 'Source/containers/CommonComponents'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
    legendsPaper: {
        padding: theme.spacing.unit * 2,
    }
})
const LayerItem = SortableElement(({ layer, layerIndex, handleLayerVisibilty }) => {
    return (
        <ListItem className="layer-switcher-item dense" button>
            <Checkbox
                checked={layer.getVisible()}
                tabIndex={-1}
                onChange={handleLayerVisibilty(layerIndex)}
                disableRipple
            />
            <Message message={layer.getProperties().title} wrap={false} align="left" type="body1" />
        </ListItem>
    )
})
const LayerList = SortableContainer(({ layers, handleLayerVisibilty }) => {
    return (
        <List subheader={<ListSubheader>{"Drag & Drop To Order the Layers"}</ListSubheader>}>
            {layers.map((layer, index) => (
                <LayerItem handleLayerVisibilty={handleLayerVisibilty} key={`item-${index}`} index={index} layerIndex={index} layer={layer} />
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
            handleLayerVisibilty
        } = this.props
        return (
            <Paper className={classes.legendsPaper} elevation={0}>
                {mapLayers.length > 0 && <LayerList layers={mapLayers} handleLayerVisibilty={handleLayerVisibilty} helperClass="sortable-container" onSortEnd={changeLayerOrder} />}
                {mapLayers.length == 0 && <Message message="No Layers" align="center" type="body1" />}
            </Paper>
        )
    }
}
CartoviewLayerSwitcher.propTypes = {
    classes: PropTypes.object.isRequired,
    mapLayers: PropTypes.array.isRequired,
    changeLayerOrder: PropTypes.func.isRequired,
    handleLayerVisibilty: PropTypes.func.isRequired
}
export default withStyles(styles)(CartoviewLayerSwitcher)
