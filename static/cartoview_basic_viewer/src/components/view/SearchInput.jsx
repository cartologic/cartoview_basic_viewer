import CloseIcon from '@material-ui/icons/Close'
import Input from '@material-ui/core/Input'
import { Loader } from 'Source/containers/CommonComponents'
import PropTypes from 'prop-types'
import React from 'react'
import SearchIcon from '@material-ui/icons/Search'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'

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
    }
})
class GeoCodeSearchInput extends React.Component {
    handleKeyPress = (event) => {
        const { config } = this.props
        if (event.key == 'Enter' && config.searchText != '') {
            config.geocodeSearch()

        }
    }
    render() {
        const { classes, config } = this.props
        return (
            <div className={classNames("search-paper fill-out-empty", [classes.paper])} elevation={1}>
                <Input
                    placeholder="Search(Geocoding)...."
                    onChange={config.handleGeocodingChange}
                    className={classes.textField}
                    inputProps={{ onKeyPress: this.handleKeyPress }}
                    value={config.searchText}
                />
                {config.searchText && config.searchText !== '' && <SearchIcon onTouchTap={() => config.geocodeSearch()} className={classes.icon} />}
                {config.geocodingResult.length > 0 && <CloseIcon onTouchTap={config.resetGeocoding} className={classes.icon} />}
                {config.geocodeSearchLoading && <Loader size={30} thickness={3} />}
            </div>
        )
    }
}
GeoCodeSearchInput.propTypes = {
    classes: PropTypes.object.isRequired,
    config: PropTypes.shape({
        searchText: PropTypes.string.isRequired,
        geocodeSearch: PropTypes.func.isRequired,
        geocodeSearchLoading: PropTypes.bool.isRequired,
        handleGeocodingChange: PropTypes.func.isRequired,
        resetGeocoding: PropTypes.func.isRequired,
    })
}
export default withStyles(styles)(GeoCodeSearchInput)
