import React, { Component } from 'react'

import ContentGrid from 'Source/components/view/ContentGrid'
import ErrorHandler from './ErrorHandler'
import { MuiThemeProvider } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { theme } from 'Source/components/view/theme.jsx'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    root: {
        height: '100%'
    }
})
injectTapEventPlugin()
class BasicViewer extends Component {
    render() {
        let { classes, childrenProps } = this.props
        return (
            <MuiThemeProvider theme={theme}>
                <ErrorHandler>
                    <div className={classes.root}>
                        <ContentGrid childrenProps={childrenProps} map={childrenProps.map} />
                    </div>
                </ErrorHandler>
            </MuiThemeProvider >
        )
    }
}
BasicViewer.propTypes = {
    classes: PropTypes.object.isRequired,
    childrenProps: PropTypes.object.isRequired,
}
export default withStyles(styles)(BasicViewer)
