import '../../css/popup.css'

import ArrowLeft from 'material-ui-icons/KeyboardArrowLeft'
import ArrowRight from 'material-ui-icons/KeyboardArrowRight'
import CloseIcon from 'material-ui-icons/Close'
import IconButton from 'material-ui/IconButton'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import Typography from 'material-ui/Typography'
import classnames from 'classnames'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
    button: {
        height: 'auto'
    },
})
const FeatureAttributesTable = (props) => {
    const { currentFeature } = props
    return (
        <ul>
            {Object.keys(currentFeature.getProperties()).map((key, index) => {
                if (key != "geometry" && key !== "_layerTitle") {
                    return (
                        <div key={index}>
                            <li>
                                {`${key}`}
                            </li>
                            <li>
                                {`${currentFeature.getProperties()[key]}`}
                            </li>
                        </div>
                    )
                }
            })}
        </ul>
    )
}
FeatureAttributesTable.propTypes = {
    currentFeature: PropTypes.object.isRequired
}
class CartoviewPopup extends React.Component {
    ensureEvents = () => {
        const {
            resetFeatureCollection,
            featureIdentifyResult,
            activeFeature,
            changeShowPopup,
            nextFeature,
            previousFeature,
            zoomToFeature
        } = this.props
        let currentFeature = featureIdentifyResult.length > 0 ?
            featureIdentifyResult[activeFeature] : null
        let self = this
        var closer = self.popupCloser
        var nextB = self.nextButton
        var prevB = self.prevButton
        var zoomToB = self.zoomToButton
        if (closer.onclick === null) {
            closer.onclick = () => {
                resetFeatureCollection()
                changeShowPopup()
                return false
            }
        }
        if (nextB.onclick === null) {
            nextB.onclick = () => {
                nextFeature()
            }
        }
        if (prevB.onclick === null) {
            prevB.onclick = () => {
                previousFeature()
            }
        }
        if (zoomToB.onclick === null) {
            zoomToB.onclick = () => {
                zoomToFeature(currentFeature)
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        const { addOverlay } = this.props
        if (nextProps.showPopup ) {
            this.node.style.display = 'block'
            addOverlay(this.node)
        } else {
            this.node.style.display = 'none'
        }
    }
    componentDidUpdate(prevProps, prevState) {
        const { showPopup } = this.props
        if (showPopup) {
            this.ensureEvents()
        }
    }
    render() {
        let {
            featureIdentifyResult,
            featureIdentifyLoading,
            activeFeature,
            classes
        } = this.props
        const nextButtonVisible = (featureIdentifyResult.length > 0 &&
            activeFeature != featureIdentifyResult.length - 1)
        const currentFeature = featureIdentifyResult[activeFeature]
        return (
            <div ref={node => this.node = node} id="popup" className="ol-popup-cartoview">
                <Paper elevation={2}>
                    <div className="title-panel">
                        {featureIdentifyResult.length != 0 && <Typography type="body1" align="left" noWrap={true} color="inherit" className="element-flex title-text">{`Layer : ${currentFeature.get('_layerTitle')}`}</Typography>}
                        <IconButton color="inherit" className={classnames({ 'hidden': activeFeature===0, 'visible': activeFeature != 0, 'popup-buttons': true, [classes.button]: true })} buttonRef={(node) => this.prevButton = node} aria-label="Delete">
                            <ArrowLeft />
                        </IconButton>
                        <IconButton color="inherit" className={classnames({ 'hidden': !nextButtonVisible, 'visible': nextButtonVisible, 'popup-buttons': true, [classes.button]: true })} buttonRef={(node) => this.nextButton = node} aria-label="Delete">
                            <ArrowRight />
                        </IconButton>
                        <IconButton color="inherit" buttonRef={(node) => this.popupCloser = node} className={classes.button} aria-label="Delete">
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <div className="cartoview-popup-content">{featureIdentifyResult.length > 0 && <div>
                        <FeatureAttributesTable currentFeature={currentFeature} />
                    </div>}
                        {featureIdentifyResult.length == 0 && !featureIdentifyLoading && <h5>{"No Features at this Point"}</h5>}
                    </div>
                    <div className="cartoview-popup-actions center"><div ref={(input) => { this.zoomToButton = input }} >
                        {(featureIdentifyResult.length != 0 && !featureIdentifyLoading) && <div>
                            <i className="fa fa-search-plus" aria-hidden="true"></i> {"Zoom to Feature"}
                        </div>}
                    </div> </div>
                </Paper>
            </div>
        )
    }
}
CartoviewPopup.propTypes = {
    resetFeatureCollection: PropTypes.func.isRequired,
    zoomToFeature: PropTypes.func.isRequired,
    addOverlay: PropTypes.func.isRequired,
    changeShowPopup: PropTypes.func.isRequired,
    addStyleToFeature: PropTypes.func.isRequired,
    nextFeature: PropTypes.func.isRequired,
    previousFeature: PropTypes.func.isRequired,
    featureIdentifyResult: PropTypes.array.isRequired,
    featureIdentifyLoading: PropTypes.bool.isRequired,
    showPopup: PropTypes.bool.isRequired,
    activeFeature: PropTypes.number.isRequired,
    map: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}
export default withStyles(styles)(CartoviewPopup)
