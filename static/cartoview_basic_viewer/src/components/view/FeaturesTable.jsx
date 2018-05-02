import 'rc-table/assets/index.css'

import Table, { TableBody, TableCell, TableHead, TablePagination, TableRow } from 'material-ui/Table'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import React from 'react'
import ZoomIcon from 'material-ui-icons/ZoomIn'
import { withStyles } from 'material-ui/styles'

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell)
const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
    button: {
        height: 'auto !important'
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
})
class FeaturesTable extends React.Component {
    constructor(props) {
        super(props)
    }
    getTableCol = () => {
        const { features } = this.props
        let columns = []
        if (features.length > 0) {
            const feature = features[0]
            Object.keys(feature.getProperties()).map(property => {
                if (property !== "the_geom" && property !== "geometry") {
                    columns.push(property)
                }
            })
        }
        return columns
    }
    render() {
        const { loading, features, addStyleToFeature,
            resetFeatureCollection, classes, handlePageChange, handleRowsPerPage, page, rowsPerPage, totalFeatures, zoomToFeature, getFeatureTableData } = this.props
        return (
            <div className="feature-table-container">
                <div className="element-flex attrs-table-title">
                    {features.length > 0 && <Button onClick={() => addStyleToFeature(features)} color="primary">
                        {"Show On Map"}
                    </Button>}
                    {features.length > 0 && <Button onClick={() => resetFeatureCollection()} color="primary">
                        {"Clear Map Selection"}
                    </Button>}
                    {features.length > 0 && <Button onClick={() => getFeatureTableData(null, (page) * rowsPerPage, rowsPerPage)} color="primary">
                        {"Reset"}
                    </Button>}
                </div>
                {!loading && features.length > 0 && <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <CustomTableCell>{"Actions"}</CustomTableCell>
                            {this.getTableCol().map((col, index) => <CustomTableCell key={index}>{col}</CustomTableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {features.map((f, index) => {
                            return (
                                <TableRow className={classes.row} key={index}>
                                    <TableCell>
                                        <IconButton className={classes.button} onClick={() => zoomToFeature(f)} aria-label="Delete">
                                            <ZoomIcon />
                                        </IconButton>
                                    </TableCell>
                                    {this.getTableCol().map((col, index) => <TableCell key={index}>{f.getProperties()[col]}</TableCell>)}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>}
                {!loading && features.length > 0 && <TablePagination
                    component="div"
                    count={totalFeatures}
                    rowsPerPage={rowsPerPage}
                    labelDisplayedRows={({ from, to, count }) => `This Page Showing ${to} of ${count} Result/Total`}
                    page={page}
                    labelRowsPerPage="Number Of Features Per Page"
                    rowsPerPageOptions={[5, 10, 25, 50, 100, 200, 400]}
                    backIconButtonProps={{
                        'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'Next Page',
                    }}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handleRowsPerPage}
                />}
            </div>
        )
    }
}
FeaturesTable.propTypes = {
    features: PropTypes.array.isRequired,
    classes: PropTypes.object.isRequired,
    searchEnabled: PropTypes.bool.isRequired,
    totalFeatures: PropTypes.number.isRequired,
    zoomToFeature: PropTypes.func.isRequired,
    getFeatureTableData: PropTypes.func.isRequired,
    addStyleToFeature: PropTypes.func.isRequired,
    resetFeatureCollection: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    handlePageChange: PropTypes.func.isRequired,
    handleRowsPerPage: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired
}
export default withStyles(styles)(FeaturesTable) 