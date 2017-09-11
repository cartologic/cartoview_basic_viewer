import '../css/popup.css'

import React, { Component } from 'react'

import Paper from 'material-ui/Paper'
import ReactDOM from 'react-dom'
import Spinner from "react-spinkit"
import ol from 'openlayers'

ol.SIMPLIFY_TOLERANCE = 0.5
const getFeatureInfoUrl = ( layer, coordinate, view, infoFormat ) => {
    var resolution = view.getResolution( ),
        projection = view.getProjection( )
    var url = layer.getSource( ).getGetFeatureInfoUrl( coordinate,
        resolution, projection, {
            'INFO_FORMAT': infoFormat
        } );
    return url
}
const wmsGetFeatureInfoFormats = {
    'application/json': new ol.format.GeoJSON( ),
    'application/vnd.ogc.gml': new ol.format.WMSGetFeatureInfo( )
};
export default class CartoviewPopup extends Component {
    constructor( props ) {
        super( props )
        this.state = { features: [ ], activeFeature: 0,loading:false }
    }
    setVisible = ( visible ) => {
        ReactDOM.findDOMNode( this ).style.display = visible ? 'block' :
            'none'
    }
    init = ( map ) => {
        this.overlayPopup = new ol.Overlay( {
            autoPan: true,
            element: ReactDOM.findDOMNode( this )
        } )
        map.addOverlay( this.overlayPopup )
        map.on( 'singleclick', ( e ) => {
            document.body.style.cursor = "progress"
            this.getLayers( map.getLayers( ).getArray( ) ).forEach(
                ( layer ) => {
                    this.setState( {
                        features: [ ],
                        activeFeature: 0
                    } )
                    this.setState({loading:true})
                    const view = map.getView( )
                    const url = getFeatureInfoUrl( layer, e.coordinate,
                        view, 'application/json' )
                    fetch( url ).then( ( response ) =>
                        response.json( ) ).then( ( result ) => {
                        
                        const features =
                            wmsGetFeatureInfoFormats[
                                'application/json' ].readFeatures(
                                result )
                        const crs = result.crs.properties
                            .name.split( ":" ).pop( )
                        if ( features.length == 1 ) {
                            if ( proj4.defs( 'EPSG:' +
                                    crs ) ) {
                                features[ 0 ].getGeometry( )
                                    .transform(
                                        'EPSG:' + crs,
                                        map.getView( )
                                        .getProjection( )
                                    )
                                features.forEach(f => f.set("_layerTitle", layer.get('title')))
                                this.setState( { features: this
                                        .state
                                        .features
                                        .concat(
                                            features
                                        ),loading:false },this.setVisible( true ) )
                                this.overlayPopup.setPosition(e.coordinate)
                                document.body.style.cursor = "default"
                            } else {
                                fetch(
                                    "http://epsg.io/?format=json&q=" +
                                    crs ).then(
                                    response =>
                                    response.json( )
                                ).then( projres => {
                                    proj4.defs(
                                        'EPSG:' +
                                        crs,
                                        projres
                                        .results[
                                            0
                                            ]
                                        .proj4
                                    )
                                    features[0 ].getGeometry( ).transform(
                                            'EPSG:' +
                                            crs,
                                            map
                                            .getView( )
                                            .getProjection( )
                                        )
                                    features.forEach(f => f.set("_layerTitle", layer.get('title')))
                                    this.setState( { features: this
                                            .state
                                            .features
                                            .concat(
                                                features
                                            ),loading:false },this.setVisible( true ) )
                                    this.overlayPopup.setPosition(e.coordinate)
                                    document.body.style.cursor = "default"
                                } )
                            }
                        } else if ( features.length >
                            1 ) {
                            let transformedFeatures = [ ]
                            features.forEach( (
                                feature ) => {
                                feature.getGeometry( )
                                    .transform(
                                        'EPSG:' +
                                        crs,
                                        map.getView( )
                                        .getProjection( )
                                    )
                                feature.set("_layerTitle", layer.get('title'))
                                transformedFeatures
                                    .push(
                                        feature
                                    )
                            } )
                            this.setState( { features: this
                                    .state.features
                                    .concat(
                                        transformedFeatures
                                    ),loading:false },this.setVisible( true ) )
                            this.overlayPopup.setPosition(e.coordinate)
                            document.body.style.cursor = "default"
                        }
                    } )
                } )
            
        } )
    }
    isWMS( layer ) {
        return layer.getSource( ) instanceof ol.source.TileWMS || layer.getSource( ) instanceof ol
            .source.ImageWMS;
    }
    getLayers( layers ) {
        var children = [ ];
        layers.forEach( ( layer ) => {
            if ( layer instanceof ol.layer.Group ) {
                children = children.concat( this.getLayers( layer.getLayers( ) ) );
            } else if ( layer.getVisible( ) && this.isWMS( layer ) ) {
                children.push( layer );
            }
        } )
        return children;
    }
    prev = ( ) => {
        let { activeFeature } = this.state
        activeFeature--
        this.setState( { activeFeature } )
    };
    next = ( ) => {
        let { activeFeature } = this.state
        activeFeature++
        this.setState( { activeFeature } )
    }
    zoomToFeature = ( feature ) => {
        let map = this.props.map
        map.getView( ).fit( feature.getGeometry( ).getExtent( ), map.getSize( ), { duration: 10000 } )
    }
    ensureEvents = ( ) => {
        let self = this;
        var closer = ReactDOM.findDOMNode( self.refs.popupCloser )
        var nextB = ReactDOM.findDOMNode( self.nextButton )
        var prevB = ReactDOM.findDOMNode( self.prevButton )
        var zoomToB = ReactDOM.findDOMNode( self.zoomToButton )
        if ( closer.onclick === null ) {
            closer.onclick = ( ) => {
                self.setVisible( false )
                return false
            }
        }
        if ( nextB.onclick === null ) {
            nextB.onclick = ( ) => {
                self.next( )
            }
        }
        if ( prevB.onclick === null ) {
            prevB.onclick = ( ) => {
                self.prev( )
            }
        }
        if ( zoomToB.onclick === null ) {
            zoomToB.onclick = ( ) => {
                self.zoomToFeature( self.state.features[ self.state.activeFeature ] )
            }
        }
    }
    componentDidMount( ) {
        this.init( this.props.map )
        this.ensureEvents( )
    }
    render( ) {
        let { activeFeature, features,loading } = this.state
        return (
            <div id="popup" className="ol-popup-cartoview hisham">
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
