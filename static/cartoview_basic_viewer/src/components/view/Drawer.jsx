import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import { Loader, Message } from '../../containers/CommonComponents'

import CollapsibleItem from './CollapsibleItem'
import HomeIcon from 'material-ui-icons/Home'
import Img from 'react-image'
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
    collapsibleItem: {
        padding: theme.spacing.unit * 2,
    }
})
class CartoviewDrawer extends React.Component {
    render() {
        const {
            classes,
            className,
            legends,
            urls
        } = this.props
        return (
            <Paper elevation={6} className={classnames(classes.root, className)}>
                <NavBar />
                <Paper className={classes.collapsibleItem} elevation={0}>
                <CollapsibleItem open={false} title="Links">
                    <List>
                        <ListItem onTouchTap={()=>window.location.href=urls.appInstancesPage} button>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>
                    </List>
                </CollapsibleItem>
                    <CollapsibleItem title="Legends">
                        <List>
                            {legends.map((legend, index) => {
                                return (<ListItem key={index} button><Message align="left" message={`${legend.layer}`} type={"body1"} />
                                    <Img src={[
                                        legend.url
                                    ]}
                                        loader={<Loader />} />
                                </ListItem>)
                            })}
                        </List>
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
    urls:PropTypes.object.isRequired
}
export default withStyles(styles)(CartoviewDrawer)
