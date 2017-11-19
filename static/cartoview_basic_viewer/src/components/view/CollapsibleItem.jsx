import Collapse from 'material-ui/transitions/Collapse'
import Divider from 'material-ui/Divider'
import ExpandMoreIcon from 'material-ui-icons/ExpandMore'
import IconButton from 'material-ui/IconButton'
import { Message } from '../../containers/CommonComponents'
import PropTypes from 'prop-types'
import React from 'react'
import classnames from 'classnames'
import { withStyles } from 'material-ui/styles'
const styles = theme => ({
    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
})
class Collapsible extends React.Component {
    constructor(props) {
        super(props)
        const { open } = this.props
        this.state = {
            expanded: typeof (open) !== "undefined" ? open : true
        }
    }
    handleDetailsExpand = () => {
        this.setState({ expanded: !this.state.expanded })
    }
    render() {
        const { classes, children, title } = this.props
        return (
            <div>
                <div className="element-flex">
                    <div className="attrs-table-title">
                        <Message align="center" message={title} classes={classes} type="body2" />
                    </div>
                    <div className="fill-out-empty" />
                    <IconButton
                        className={classnames(classes.expand, {
                            [classes.expandOpen]: this.state.expanded,
                        })}
                        onTouchTap={this.handleDetailsExpand}
                        aria-expanded={this.state.expanded}
                        aria-label="Show more"
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </div>

                <Collapse in={this.state.expanded} transitionDuration="auto" unmountOnExit>
                    {children}
                </Collapse>
                <Divider />
            </div>

        )
    }
}
Collapsible.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.object.isRequired,
    open: PropTypes.bool
}
export default withStyles(styles)(Collapsible)