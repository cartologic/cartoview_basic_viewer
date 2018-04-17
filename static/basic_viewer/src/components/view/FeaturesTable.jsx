import 'react-table/react-table.css'

import PropTypes from 'prop-types'
import React from 'react'
import ReactTable from 'react-table'

class FeaturesTable extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const { data,
            columns,
            getTableData,
            pages,
            loading } = this.props
        return (
            <div className="feature-table-container">
                <ReactTable
                    columns={columns}
                    manual
                    data={data}
                    pages={pages}
                    loading={loading}
                    onFetchData={getTableData}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            </div>
        )
    }
}
FeaturesTable.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    getTableData: PropTypes.func.isRequired,
    pages: PropTypes.number,
    loading: PropTypes.bool.isRequired,
    tableLayer: PropTypes.string.isRequired,
}
export default FeaturesTable