import ol from 'openlayers'
const image = new ol.style.Circle( {
    radius: 5,
    fill: new ol.style.Fill( { color: 'rgba(110, 247, 252, 0.4)' } ),
    stroke: new ol.style.Stroke( { color: 'rgba(110, 247, 252, 1)', width: 2 } )
} )
const styles = {
    'Point': new ol.style.Style( { image: image } ),
    'LineString': new ol.style.Style( {
        stroke: new ol.style.Stroke( { color: 'green', width: 1 } )
    } ),
    'MultiLineString': new ol.style.Style( {
        stroke: new ol.style.Stroke( { color: 'green', width: 1 } )
    } ),
    'MultiPoint': new ol.style.Style( { image: image } ),
    'MultiPolygon': new ol.style.Style( {
        stroke: new ol.style.Stroke( { color: 'rgba(245, 110, 252, 1)', width: 1 } ),
        fill: new ol.style.Fill( { color: 'rgba(245, 110, 252, 0.4)' } )
    } ),
    'Polygon': new ol.style.Style( {
        stroke: new ol.style.Stroke( {
            color: 'rgba(240, 252, 110, 1)',
            lineDash: [
                4 ],
            width: 3
        } ),
        fill: new ol.style.Fill( { color: 'rgba(240, 252, 110, 0.4)' } )
    } ),
    'GeometryCollection': new ol.style.Style( {
        stroke: new ol.style.Stroke( { color: 'magenta', width: 2 } ),
        fill: new ol.style.Fill( { color: 'magenta' } ),
        image: new ol.style.Circle( {
            radius: 10,
            fill: null,
            stroke: new ol.style.Stroke( { color: 'magenta' } )
        } )
    } ),
    'Circle': new ol.style.Style( {
        stroke: new ol.style.Stroke( { color: 'rgba(252, 110, 202, 1)', width: 2 } ),
        fill: new ol.style.Fill( { color: 'rgba(252, 110, 202, 0.4)' } )
    } )
}
export const styleFunction = ( feature ) => {
    return styles[ feature.getGeometry( ).getType( ) ]
}