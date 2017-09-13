import './app.css'

import { IntlProvider, addLocaleData } from 'react-intl'

import $ from "jquery"
import BaseMapModal from '@boundlessgeo/sdk/components/BaseMapModal'
import CartoviewPopup from './components/popup.jsx'
import CustomTheme from './theme'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import LayerList from '@boundlessgeo/sdk/components/LayerList'
import LoadingPanel from '@boundlessgeo/sdk/components/LoadingPanel'
import MapPanel from '@boundlessgeo/sdk/components/MapPanel'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import React from 'react'
import Zoom from '@boundlessgeo/sdk/components/Zoom'
import { connect } from 'react-redux'
import enLocaleData from 'react-intl/locale-data/en'
import enMessages from '@boundlessgeo/sdk/locale/en'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import injectTapEventPlugin from 'react-tap-event-plugin'
import {
    loadMap
} from './actions/map'
import ol from 'openlayers'
import { render } from 'react-dom'
import { viewStore } from './store/stores'

ol.SIMPLIFY_TOLERANCE = 0.5
injectTapEventPlugin( );
addLocaleData( enLocaleData );
class ReactClient extends React.Component {
    componentWillMount( ) {
        this.map = this.props.map
        this.props.updateMap( this.props.mapUrl )
    }
    getChildContext( ) {
        return { muiTheme: getMuiTheme( CustomTheme ) };
    }
    componentDidMount( ) {
        this.map.once( 'postrender', ( event ) => {
            $( ".se-pre-con" ).fadeOut( "slow" )
        } )
    }
    _toggleBaseMapModal( ) {
        this.baseMapRef.getWrappedInstance( ).open( )
    }
    render( ) {
        let {appConfig}=this.props
        const basemap_button = appConfig.showBaseMapSwitcher ?
            <FloatingActionButton className="basemap_button" onTouchTap={this._toggleBaseMapModal.bind(this)} mini={true}>
          <i className="fa fa-map" aria-hidden="true"></i>
        </FloatingActionButton> :
            "";
        const base_map_modal = appConfig.showBaseMapSwitcher ?
            <BaseMapModal ref={baseMapRef => this.baseMapRef = baseMapRef} map={this.map}/> : ""
        let layerlist = appConfig.showLayerSwitcher ?
            <LayerList allowFiltering={true} includeLegend={appConfig.showLegend ? true : false} showOpacity={true} showDownload={true} showGroupContent={true} showZoomTo={true} allowReordering={true} map={this.map}/> :
            '';
        let zoom = appConfig.showZoombar ? <Zoom map={this.map}/> : '';
        return (
            <div className="full-height-width">
        {basemap_button}
        <MapPanel map={this.map}></MapPanel>
		<LoadingPanel map={this.map}></LoadingPanel>
        {layerlist}
        {base_map_modal}
        {zoom}
		<CartoviewPopup map={this.map} />
      </div>
        )
    }
}
ReactClient.childContextTypes = {
    muiTheme: PropTypes.object
}
ReactClient.propTypes = {
    updateMap: PropTypes.func.isRequired,
    map: PropTypes.object.isRequired,
    mapUrl:PropTypes.string.isRequired,
    mapId:PropTypes.number.isRequired,
    abstract:PropTypes.string.isRequired,
    appConfig:PropTypes.object.isRequired
}
const mapStateToProps = ( state ) => {
    return {
        map: state.map,
    }
}
const mapDispatchToProps = ( dispatch ) => {
    return {
        updateMap: ( url ) => dispatch( loadMap( url ) )
    }
}
let App = connect( mapStateToProps, mapDispatchToProps )( ReactClient )
export default App
global.BasicViewer={
    view:(element,props)=>{
        render(
            <Provider store={viewStore}>
            <IntlProvider locale='en' messages={enMessages}>
          <App {...props}></App>
        </IntlProvider></Provider>,
            document.getElementById( element ) )
    }
}
