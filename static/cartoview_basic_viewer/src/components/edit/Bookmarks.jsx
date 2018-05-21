import 'ol/ol.css'

import BasicViewerHelper from 'cartoview-sdk/helpers/BasicViewerHelper'
import PropTypes from 'prop-types'
import React from 'react'
import classNames from 'classnames'
import { getPropertyFromConfig } from 'Source/containers/staticMethods'

export default class Bookmarks extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            bookmarks: this.getFormValue(this.props),
            map: BasicViewerHelper.getMap(),
            showMap: false
        }
        global.map=this.state.map
    }
    getComponentValue = () => {
        return { bookmarks: this.state.bookmarks }
    }
    getFormValue = (props) => {
        const { config } = props
        const value = getPropertyFromConfig(config,
            'bookmarks', [])
        return value
    }
    componentDidMount = () => {
        let { map } = this.state
        map.setTarget(this.mapDiv)

    }
    componentWillReceiveProps(nextProps) {
        const { config, instanceId } = this.props

        if (config && !instanceId) {
            this.setState({ bookmarks: this.getFormValue(nextProps) })
        }

    }
    showMap = () => {
        this.setState({ showMap: !this.state.showMap }, () => {
            this.state.map.updateSize()
            this.state.map.render()
        })
    }
    addBookmark = () => {
        const { bookmarks, map } = this.state
        let newBookmarks = []
        newBookmarks.push({
            name: 'New Bookmark', extent: map.getView().calculateExtent().join('/')
        })
        const newValue = [...bookmarks, ...newBookmarks]
        this.setState({ bookmarks: newValue })


    }
    onChange = index => event => {
        const { bookmarks } = this.state
        let newBookmarks = [...bookmarks]
        let editedOne = newBookmarks[index]
        editedOne.name = event.target.value
        newBookmarks.splice(index, 1, editedOne)
        this.setState({ bookmarks: newBookmarks })
    }
    onDescriptionChange = index => event => {
        const { bookmarks } = this.state
        let newBookmarks = [...bookmarks]
        let editedOne = newBookmarks[index]
        editedOne.description = event.target.value
        newBookmarks.splice(index, 1, editedOne)
        this.setState({ bookmarks: newBookmarks })
    }
    removeBookmark = (index) => {
        const { bookmarks } = this.state
        let newBookmarks = [...bookmarks]
        newBookmarks.splice(index, 1)
        this.setState({ bookmarks: newBookmarks })
    }
    render() {
        const { showMap, bookmarks } = this.state
        return (
            <div>
                <h3>{"Bookmarks"}</h3>
                <div id="map" ref={(mapDiv) => this.mapDiv = mapDiv} className={classNames("bookmarks-map", { 'hidden': !showMap })}></div>
                <hr />
                <div className="bookmark-item">
                    <button onClick={this.showMap} className='btn btn-primary'>{`${showMap ? 'Hide' : 'Show'} Map`}</button>
                    {showMap && <button onClick={this.addBookmark} className='btn btn-primary'>{`add Bookmark`}</button>}
                </div>
                {bookmarks.map((bookmark, index) => {
                    return <div key={index} className='bookmark-item'>
                        <div className="form-group">
                            <label htmlFor={`name${index}`}>{"Name: "}</label>
                            <input onChange={this.onChange(index)} type="text" className="form-control" value={bookmark.name} id={`name${index}`} />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`description${index}`}>{"Description: "}</label>
                            <input onChange={this.onDescriptionChange(index)} type="text" className="form-control" value={bookmark.description} id={`description${index}`} />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`extent${index}`}>{"Extent: "}</label>
                            <input disabled={true} type="text" className="form-control" value={bookmark.extent} id={`extent${index}`} />
                        </div>
                        <div>
                            <button onClick={() => this.removeBookmark(index)} className={"btn btn-danger"}>{'Remove'}</button>
                        </div>
                    </div>
                })}
            </div>
        )
    }
}
Bookmarks.propTypes = {
    config: PropTypes.object,
    instanceId: PropTypes.number
}
