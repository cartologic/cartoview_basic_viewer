import CollapsibleItem from './CollapsibleItem'
import NavBar from './NavBar.jsx'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import classnames from 'classnames'
import { withStyles } from 'material-ui/styles'
const styles = theme => ({
    root: {
        height: "100%",
    },
    collapsibleItem:{
        padding:theme.spacing.unit,
    }
})
class CartoviewDrawer extends React.Component {
    render() {
        const {
            classes,
            className,
            legends
        } = this.props
        return (
            <Paper elevation={6} className={classnames(classes.root, className)}>
                <NavBar />
                <Paper className={classes.collapsibleItem} elevation={0}>
                    <CollapsibleItem title="Legends">
                        <div>
                            {legends.map((legend, index) => {
                                return (<div className={classes.collapsibleItem} key={index}><h5>{`${legend.layer}`}</h5>
                                    <img  src={legend.url} />
                                </div>)
                            })}
                        </div>
                    </CollapsibleItem>
                </Paper>
            </Paper>
        )
    }
}
CartoviewDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
    legends: PropTypes.array.isRequired,
}
export default withStyles(styles)(CartoviewDrawer)
