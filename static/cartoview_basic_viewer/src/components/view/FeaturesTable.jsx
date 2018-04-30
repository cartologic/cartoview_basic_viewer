import 'rc-table/assets/index.css'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import React from 'react'
import Table from 'rc-table'
import ZoomIcon from 'material-ui-icons/ZoomIn'

class FeaturesTable extends React.Component {
    constructor(props) {
        super(props)
    }
    getTableCol = () => {
        const { features, zoomToFeature } = this.props
        let columns = []
        if (features.length > 0) {
            columns.push({
                title: 'Operations',
                dataIndex: '',
                key: 'Operations',
                render: text => <IconButton style={{ height: 'auto' }} aria-label="Delete" color="primary">
                    <ZoomIcon />
                </IconButton>,
                onCell: record => ({
                    onClick(e) {
                        zoomToFeature(record.feature)
                    },
                }),
            })
            const feature = features[0]
            Object.keys(feature.getProperties()).map(property => {
                if (property !== "the_geom" && property !== "geometry") {
                    columns.push({
                        title: property, dataIndex: property, key: property, width: 80
                    })
                }
            })
        }
        return columns
    }
    getTableData = () => {
        const { features } = this.props
        let data = []
        features.map((feature, index) => {
            data.push({ ...feature.getProperties(), feature: feature, key: index })
        })
        return data
    }
    render() {
        const { loading, features, addStyleToFeature, resetFeatureCollection } = this.props
        const columns = this.getTableCol()
        const data = this.getTableData()
        return (
            <div className="feature-table-container">
                <div className="element-flex attrs-table-title">
                    {features.length > 0 && <Button disabled color="primary">
                        {`${features.length} Found`}
                    </Button>}
                    {features.length > 0 && <Button onClick={() => addStyleToFeature(features)} color="primary">
                        {"Show On Map"}
                    </Button>}
                    {features.length > 0 && <Button onClick={() => resetFeatureCollection()} color="primary">
                        {"Clear Map Selection"}
                    </Button>}
                </div>
                {!loading && <Table scroll={{ x: true }} columns={columns} data={data} />}
            </div>
        )
    }
}
FeaturesTable.propTypes = {
    features: PropTypes.array.isRequired,
    zoomToFeature: PropTypes.func.isRequired,
    addStyleToFeature: PropTypes.func.isRequired,
    resetFeatureCollection: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
}
export default FeaturesTable