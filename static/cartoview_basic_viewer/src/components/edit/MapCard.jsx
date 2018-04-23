import Img from 'react-image'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'react-spinkit'

export const MapCard = (props) => {
    const { selectMap, map, selectedMap, urls } = props
    return (
        <div
            onClick={() => selectMap(map)}
            key={map.id}
            className={ selectedMap && (selectedMap.id === map.id)
                ? "row row-fix resource-box bg-success"
                : "row row-fix resource-box"}>

            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4 resource-box-img-container">
                <Img
                    className="resource-box-img"
                    src={[map.thumbnail_url, urls.noImage]}
                    loader={< Spinner name="line-scale-pulse-out" color="steelblue" />} />
            </div>

            <div className="col-xs-12 col-sm-8 col-md-8 col-lg-8 resource-box-text title-wrap">
                <h4 className="title-wrap">{map.title}</h4>
                <p className="title-wrap">
                    {map.abstract}
                </p>
                <small>owner: {map.owner__username}</small><br />
                <a type="button"
                    href={urls.mapDetails(map.id)}
                    target="_blank"
                    className="btn btn-primary map-details-button">
                    {'Details'}
                </a>
            </div>
        </div>
    )
}
MapCard.propTypes = {
    selectMap: PropTypes.func.isRequired,
    map: PropTypes.object.isRequired,
    selectedMap: PropTypes.object,
    urls: PropTypes.object.isRequired
}