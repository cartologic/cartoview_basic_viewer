import List, { ListItem, ListItemText } from 'material-ui/List'

import Img from 'react-image'
import { Loader } from 'Source/containers/CommonComponents'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import classNames from 'classnames'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
    hide: {
        display: 'none'
    }
})
class GeocodeResult extends React.Component {
    zoomTo = (lon, lat) => {
        const { action, resetGeocoding } = this.props
        resetGeocoding()
        action([parseFloat(lon), parseFloat(lat)])
    }
    render() {
        const { geocodingResult, classes, geocodeSearchLoading, boundlessGeoCodingEnabled } = this.props
        if (boundlessGeoCodingEnabled) {
            return (
                <Paper className={classNames("geocoding-result", { [classes.hide]: geocodeSearchLoading })} elevation={0} >
                    <List className="full-width" component="nav">
                        {geocodingResult.map(((item, index) => {
                            return (
                                <ListItem onTouchTap={() => this.zoomTo(item.x, item.y)} key={index} button>
                                    {<Img src={urls.static+'cartoview_basic_viewer/icon.png'} loader={<Loader />} />}
                                    <ListItemText inset primary={item.candidatePlace} secondary={item.class} />
                                </ListItem>
                            )
                        }))}
                    </List>
                </Paper>
            )
        }
        return (
            <Paper className={classNames("geocoding-result", { [classes.hide]: geocodeSearchLoading })} elevation={0} >
                <List className="full-width" component="nav">
                    {geocodingResult.map(((item, index) => {
                        return (
                            <ListItem onTouchTap={() => this.zoomTo(item.lon, item.lat)} key={index} button>
                                {item.icon && <Img src={item.icon} loader={<Loader />} />}
                                <ListItemText inset primary={item.display_name} secondary={item.class} />
                            </ListItem>
                        )
                    }))}
                </List>
            </Paper>
        )
    }
}
GeocodeResult.propTypes = {
    classes: PropTypes.object.isRequired,
    geocodingResult: PropTypes.array.isRequired,
    action: PropTypes.func.isRequired,
    geocodeSearchLoading: PropTypes.bool.isRequired
}
export default withStyles(styles)(GeocodeResult)
