import React, { Component } from 'react'

// import ArrowLeft from 'material-ui-icons/KeyboardArrowLeft'
// import ArrowRight from 'material-ui-icons/KeyboardArrowRight'
// import CartoviewList from './CartoviewList'
// import { CartoviewSnackBar } from './statelessComponents'
import Grid from 'material-ui/Grid'
// import IconButton from 'material-ui/IconButton'
// import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import Slide from 'material-ui/transitions/Slide'
// import classnames from "classnames"
import compose from 'recompose/compose'
import { withStyles } from 'material-ui/styles'
import withWidth from 'material-ui/utils/withWidth'

const styles = theme => ( {
    root: {
        height: "100%"
    },
    drawer: {
        width: "30%",
        height: "100%",
        zIndex: "1150",
        position: "fixed",
        [ theme.breakpoints.down( 'md' ) ]: {
            width: "90%"
        },
    },
    drawerClose: {
        width: "0%",
        height: "100%",
        zIndex: "1150",
        position: "fixed"
    },
    drawerContainer: {
        left: "0px !important"
    }
} )

function Transition( props ) {
    return <Slide direction="left" {...props} />
}
class ContentGrid extends Component {
    componentDidMount() {
        const { childrenProps } = this.props
        childrenProps.map.setTarget( this.mapDiv )
    }
    componentDidUpdate( prevProps, prevState ) {
        const { width } = this.props
        if ( prevProps.width !== width ) {
            prevProps.childrenProps.map.updateSize()
        }
    }
    render() {
        const { classes, childrenProps } = this.props
        return (
            <div className={classes.root}>
                {/* <div className={classnames({ [classes.drawer]: childrenProps.drawerOpen ? true : false, [classes.drawerClose]: childrenProps.drawerOpen ? false : true })}>
                    <Paper className={classnames({ "drawer-button-container": true, [classes.drawerContainer]: childrenProps.drawerOpen ? false : true })}>
                        <IconButton onTouchTap={childrenProps.toggleDrawer} color="default" aria-label="add" className={"drawer-button"}>
                            {childrenProps.drawerOpen ? <ArrowLeft /> : <ArrowRight />}
                        </IconButton>
                    </Paper>
                    <Transition in={childrenProps.drawerOpen} direction={"right"}>
                        <CartoviewList {...childrenProps} />
                    </Transition>
                </div> */}
                <Grid className={classes.root} container alignItems={"stretch"} spacing={0}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <div ref={(mapDiv) => this.mapDiv = mapDiv} className="map-panel"></div>
                    </Grid>
                </Grid>
                {/* <CartoviewSnackBar open={childrenProps.featureIdentifyLoading} message={"Searching For Features at this Point"} /> */}
            </div>
        )
    }
}
ContentGrid.propTypes = { 
    childrenProps:PropTypes.object.isRequired,
    classes:PropTypes.object.isRequired,
    width: PropTypes.string,
}
export default compose( withStyles( styles ), withWidth() )( ContentGrid )
