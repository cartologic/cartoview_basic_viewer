import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List'

import Avatar from 'material-ui/Avatar'
import BasicViewerHelper from 'Source/helpers/BasicViewerHelper'
import CityIcon from 'material-ui-icons/LocationCity'
import IconButton from 'material-ui/IconButton'
import { Message } from 'Source/containers/CommonComponents'
import PropTypes from 'prop-types'
import React from 'react'
import ZoomInIcon from 'material-ui-icons/ZoomIn'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
    root: {
        padding: theme.spacing.unit * 2
    },
})
class Bookmarks extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: ''
        }
    }
    handleChange = (bookmark) => {
        const { map } = this.props
        const extent = bookmark.extent.split('/').map(number => parseFloat(number))
        BasicViewerHelper.fitExtent(extent, map)
    }

    render() {
        const { classes, bookmarks } = this.props
        return (
            <div className={classes.root}>
                {bookmarks && bookmarks.length > 0 && <List>
                    {bookmarks.map((bookmark, index) => {
                        return <ListItem
                            key={index}
                        >
                            <Avatar>
                                <CityIcon />
                            </Avatar>
                            <ListItemText primary={bookmark.name} />
                            <ListItemSecondaryAction>
                                <IconButton onClick={() => this.handleChange(bookmark)} aria-label={`Zoom To ${bookmark.name}`}>
                                    <ZoomInIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    })}
                </List>}
                {(!bookmarks || bookmarks.length == 0)&&<Message message={"No Bookmarks"} type="caption"/>}
            </div>
        )
    }
}
Bookmarks.propTypes = {
    classes: PropTypes.object.isRequired,
    bookmarks: PropTypes.array.isRequired,
    map: PropTypes.object.isRequired
}

export default withStyles(styles)(Bookmarks)