import List, { ListItem, ListItemText } from 'material-ui/List'

import CloseIcon from 'material-ui-icons/Close'
import Img from 'react-image'
import Input from 'material-ui/Input'
import { Loader } from 'Source/containers/CommonComponents'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import SearchIcon from 'material-ui-icons/Search'
import classNames from 'classnames'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
    textField: {
        width: '100%',
    },
    paper: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        color: theme.palette.primary.main
    },
    searchItem: {
        width: '100%',
        height: '200px',
        display: 'flex',
        overflowY: 'overlay'
    },
    hide: {
        display: 'none'
    }
})
class GeoCodeSearchInput extends React.Component {
    state = {
        searchText: '',
        geocodingResult: []
    }
    handleChange = event => {
        let data = {
            searchText: event.target.value
        }
        if (event.target.value == '') {
            data.geocodingResult = []
        }
        this.setState(data)
    }
    zoomTo = (lon, lat) => {
        const { action } = this.props
        this.reset()
        action([parseFloat(lon), parseFloat(lat)])
    }
    reset = () => {
        this.setState({ geocodingResult: [], searchText: '' })
    }
    handleKeyPress = (event) => {
        const { searchText } = this.state
        const { geocodeSearch } = this.props
        if (event.key == 'Enter' && searchText != '') {
            geocodeSearch(searchText, (res) => this.setState({ geocodingResult: res }))

        }
    }
    render() {
        const { classes, geocodeSearch, geocodeSearchLoading } = this.props
        let { searchText, geocodingResult } = this.state
        return (
            <div>
                <Paper className={classNames("search-paper", [classes.paper])} elevation={1}>
                    <Input
                        placeholder="Search(Geocoding)...."
                        onChange={this.handleChange}
                        className={classes.textField}
                        inputProps={{ onKeyPress: this.handleKeyPress }}
                        value={searchText}
                    />
                    {searchText && searchText !== '' && <SearchIcon onTouchTap={() => geocodeSearch(searchText, (res) => this.setState({ geocodingResult: res }))} className={classes.icon} />}
                    {geocodingResult.length > 0 && <CloseIcon onTouchTap={() => this.reset()} className={classes.icon} />}
                    {geocodeSearchLoading && <Loader size={30} thickness={3} />}
                </Paper>
                {!geocodeSearchLoading && geocodingResult.length > 0 && <Paper className={classNames(classes.searchItem, { [classes.hide]: geocodeSearchLoading })}>
                    <List className="full-width" component="nav">
                        {geocodingResult.map(((item, index) => {
                            return (
                                <ListItem onTouchTap={() => this.zoomTo(item.lon, item.lat)} key={index} button>
                                    {item.icon && <Img src={item.icon} />}
                                    <ListItemText inset primary={item.display_name} secondary={item.class} />
                                </ListItem>
                            )
                        }))}
                    </List>
                </Paper>}
            </div>
        )
    }
}
GeoCodeSearchInput.propTypes = {
    classes: PropTypes.object.isRequired,
    geocodeSearch: PropTypes.func.isRequired,
    action: PropTypes.func.isRequired,
    geocodeSearchLoading: PropTypes.bool.isRequired
}
export default withStyles(styles)(GeoCodeSearchInput)
