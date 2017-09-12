import '../css/popup.css'

import React, { Component } from 'react'
import { activeFeaturesDecrement, activeFeaturesIncrement, setOverlayPopup, setPopupVisible, singleClickListner, zoomToFeature } from '../actions/features'

import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import Spinner from "react-spinkit"
import { connect } from 'react-redux'
import ol from 'openlayers'

class CartoviewPopup extends Component {
    ensureEvents = ( ) => {
        let self = this;
        var closer = self.refs.popupCloser
        var nextB = self.nextButton
        var prevB = self.prevButton
        var zoomToB = self.zoomToButton
        if ( closer.onclick === null ) {
            closer.onclick = ( ) => {
                self.props.setVisible( false )
                return false
            }
        }
        if ( nextB.onclick === null ) {
            nextB.onclick = ( ) => {
                self.props.next()
            }
        }
        if ( prevB.onclick === null ) {
            prevB.onclick = ( ) => {
                self.props.prev()
            }
        }
        if ( zoomToB.onclick === null ) {
            zoomToB.onclick = ( ) => {
                self.props.zoomToFeature( self.props.features[ self.props.activeFeature ] )
            }
        }
    }
    componentDidMount( ) {
        let overlay = new ol.Overlay( {
            autoPan: true,
            element: this.node
        } )
        this.props.setOverlay( overlay )
        this.props.init( )
        this.ensureEvents( )
    }
    componentWillReceiveProps( nextProps ) {
        this.node.style.display = nextProps.popupVisible ?
            'block' : 'none'
    }
    render( ) {
        let {features,loading,activeFeature}=this.props
        return (
            <div ref={node => this.node = node} id="popup" className="ol-popup-cartoview hisham">
                <div className="title-panel">
                    <div ref="popupCloser">
                        <i style={{}} className="fa fa-times" aria-hidden="true"></i>
                    </div>
                    <div style={{display:(features.length>0 && activeFeature != features.length-1)? 'block': 'none'}} ref={(input) => { this.nextButton = input }}>
                        <i style={{float:'right',padding:3}} className="fa fa-arrow-circle-right" aria-hidden="true"></i>
                    </div>
                    <div style={{display:activeFeature != 0? 'block' : 'none'}} ref={(input) => { this.prevButton = input }}>
                        <i style={{float:'right',padding:3}} className="fa fa-arrow-circle-left" aria-hidden="true"></i>
                    </div>
                    {features.length !=0 && <div style={{display:features.length !=0? 'block' : 'none',flex: 1,padding:3}} ref={(input) => { this.prevButton = input }}>
                        {`Layer : ${features[activeFeature].get('_layerTitle')}`}
                    </div>}
                </div>
                <Paper zDepth={0}>
                    <div className="cartoview-popup-content">{features.length>0 && <div>
                        <ul style={{listStyleType: 'none',padding: 0}}>
                        {Object.keys(features[activeFeature].getProperties()).map((key,index)=>{
                                if (key != "geometry" && key!=="_layerTitle") {
                                    return <div key={index}><li  >
                                    {`${key}`}
                                </li>
                                <li>
                                    {`${features[activeFeature].getProperties()[key]}`}
                                </li></div>
                                }   
                            })}
                        </ul>
                        </div>}
                        {features.length==0  && !loading &&<h5>No Features at this Point</h5>}
                        
                    </div>
                    <div style={{display: 'block',textAlign:'center'}} className="cartoview-popup-actions"><div ref={(input) => { this.zoomToButton = input }} >
                        {(features.length != 0 && !loading )&& <div>
                            <i style={{padding:3}} className="fa fa-search-plus" aria-hidden="true"></i> Zoom to Feature
                            </div> }
                            {loading && <Spinner className="loading-center" name="line-scale-party" color="steelblue" />}
                        
                    </div> </div>
                </Paper>
            </div>
        )
    }
}
CartoviewPopup.propTypes = {
    init: PropTypes.func.isRequired,
    setOverlay: PropTypes.func.isRequired,
    features:PropTypes.array.isRequired,
    loading:PropTypes.bool.isRequired,
    popupVisible:PropTypes.bool.isRequired,
    activeFeature:PropTypes.number.isRequired
}
const mapStateToProps = ( state ) => {
    return {
        features: state.features,
        popupVisible: state.popupVisible,
        activeFeature:state.activeFeatures,
        loading:state.featureIsLoading
    }
}
const mapDispatchToProps = ( dispatch ) => {
    return {
        init: ( ) => dispatch( singleClickListner( ) ),
        setOverlay: ( overlay ) => dispatch( setOverlayPopup( overlay ) ),
        next: ( ) => dispatch( activeFeaturesIncrement( ) ),
        prev: ( ) => dispatch( activeFeaturesDecrement( ) ),
        zoomToFeature:(feature)=>dispatch(zoomToFeature(feature)),
        setVisible:(visible)=>dispatch(setPopupVisible(visible)),
    }
}
export default connect( mapStateToProps, mapDispatchToProps )( CartoviewPopup )
