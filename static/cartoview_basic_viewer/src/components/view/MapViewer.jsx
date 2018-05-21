import BasicViewerHelper from 'cartoview-sdk/helpers/BasicViewerHelper'
import PropTypes from 'prop-types'
import React from 'react'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'

const styles = theme => ({

})
class MapViewer extends React.Component {
    constructor(props) {
        super(props)
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.loading !== this.props.loading && !nextProps.loading) {
            this.fitHistory()
            if (nextProps.enableHistory) {
                this.handleHistory()
            }

        }
    }
    componentDidMount() {
        const { map } = this.props
        map.setTarget(this.mapDiv)
    }
    handleHistory = () => {
        const { map } = this.props
        map.on('moveend', (evt) => {
            const evtMap = evt.map
            const extent = map.getView().calculateExtent(evtMap.getSize())
            const path = `/${extent.join('/')}`
            if (this.props.match.url !== path) {
                this.props.history.push(path)
            }
        })
    }
    fitHistory = () => {
        const { map } = this.props
        const { match } = this.props
        if (match && match.params.x0 && match.params.y0) {
            let extent = [parseFloat(match.params.x0),
            parseFloat(match.params.y0)]
            if (match.params.x1 && match.params.y1)
                extent.push(parseFloat(match.params.x1), parseFloat(match.params.y1))
            if (extent !== map.getView().calculateExtent()) {
                BasicViewerHelper.fitExtent(extent, map)
            }
        }
    }
    componentDidUpdate(prevProps, prevState) {
        const { width } = this.props
        if (prevProps.width !== width) {
            prevProps.map.updateSize()
        }
    }
    render() {
        return <div id="map" ref={(mapDiv) => this.mapDiv = mapDiv} className="map-panel"></div>

    }
}
MapViewer.propTypes = {
    map: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    enableHistory: PropTypes.bool,
    loading: PropTypes.bool.isRequired,
    width: PropTypes.string,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
}
export default compose(withStyles(styles), withWidth())(MapViewer)