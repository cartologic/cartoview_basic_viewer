import { Message } from '../../containers/CommonComponents'
import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
const styles = theme => ({
    root: {
        height: '100%',
        padding: theme.spacing.unit * 2
    },
})
export function logger(message, msgType) {
    msgType = msgType || "black"
    switch (msgType) {
        case "success":
            msgType = "Green"
            break
        case "info":
            msgType = "DodgerBlue"
            break
        case "error":
            msgType = "Red"
            break
        case "warning":
            msgType = "Orange"
            break
        default:
            msgType = msgType
    }

    console.log("%c" + message, "color:" + msgType)

}
class ErrorHandler extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, }
    }

    componentDidCatch(error, info) {
        this.setState({ hasError: true, error, info })
    }

    render() {
        const { classes } = this.props
        if (this.state.hasError) {
            return <div className={classes.root}>
                <Message message={"Something went wrong."} type="title" />
                <Message message={"Contact us >> cartoview@cartologic.com"} type="title" />
                <br/>
                <Message noWrap={false} message={`${this.state.error.toString()}`} type="subheading" />
                <Message noWrap={false} message={`${this.state.info.componentStack}`} type="subheading" />
            </div>
        }
        return this.props.children
    }
}
ErrorHandler.propTypes = {
    classes: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
}
export default withStyles(styles)(ErrorHandler)