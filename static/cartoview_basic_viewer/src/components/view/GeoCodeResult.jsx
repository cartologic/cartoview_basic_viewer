import Img from 'react-image'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { Loader } from 'Source/containers/CommonComponents'
import Paper from '@material-ui/core/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'

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
        const { geocodingResult, classes, geocodeSearchLoading } = this.props
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
