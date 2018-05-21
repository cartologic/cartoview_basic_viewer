import Avatar from '@material-ui/core/Avatar'
import BasicViewerHelper from 'cartoview-sdk/helpers/BasicViewerHelper'
import CityIcon from '@material-ui/icons/LocationCity'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import { Message } from 'Source/containers/CommonComponents'
import PropTypes from 'prop-types'
import React from 'react'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    root: {
        padding: theme.spacing.unit * 2
    },
    bookmarkDetails: {
        display: 'flex',
        flexDirection: 'column'
    },
    bookmarkName:{
        padding: '0 16px !important'
    },
    bookmarkDescription:{
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: '300',
        fontSize: 'smaller',
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
        BasicViewerHelper.fitExtent(extent, map, 300)
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
                            <div className={classes.bookmarkDetails}>
                                <ListItemText primary={bookmark.name} className={classes.bookmarkName}/>
                                <ListItemText primary={bookmark.description} className={classes.bookmarkDescription} disableTypography={true}/>
                            </div>
                            <ListItemSecondaryAction>
                                <IconButton onClick={() => this.handleChange(bookmark)} aria-label={`Zoom To ${bookmark.name}`}>
                                    <ZoomInIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    })}
                </List>}
                {(!bookmarks || bookmarks.length == 0) && <Message message={"No Bookmarks"} type="caption" />}
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