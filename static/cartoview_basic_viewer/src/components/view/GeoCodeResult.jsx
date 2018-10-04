import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import Img from 'react-image'
import { Loader } from 'Source/containers/CommonComponents'

const styles = theme => ({
    hide: {
        display: 'none'
    }
})
class GeocodeResult extends React.Component {
    zoomTo = (extent) => {
        const { action, resetGeocoding } = this.props
        resetGeocoding()
        action(extent)
    }
    render() {
        const { geocodingResult, classes, geocodeSearchLoading, boundlessGeoCodingEnabled } = this.props
        console.log(geocodingResult)
        if (boundlessGeoCodingEnabled) {
            return (
                <Paper className={classNames("geocoding-result", { [classes.hide]: geocodeSearchLoading })} elevation={0} >
                    <List className="full-width" component="nav">
                        {geocodingResult.map(((item, index) => {
                            console.dir(item)
                            return (
                                <ListItem onTouchTap={() => this.zoomTo([item.x, item.y, item.x, item.y])} key={index} button>
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
                            <ListItem onTouchTap={() => this.zoomTo(item.bbox)} key={index} button>
                                <ListItemText primary={item.formatted} />
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
    resetGeocoding: PropTypes.func.isRequired,
    geocodingResult: PropTypes.array.isRequired,
    action: PropTypes.func.isRequired,
    geocodeSearchLoading: PropTypes.bool.isRequired
}
export default withStyles(styles)(GeocodeResult)
