import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import PrintService from 'cartoview-sdk/services/PrintService'
import PropTypes from 'prop-types'
import React from 'react'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    menu: {
        width: 200,
    },
    formControl: {
        margin: theme.spacing.unit,
        width: '100%'
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    fullWidth: {
        width: '100%'
    },
    modalContent: {
        display: "block",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        flex: ".5",
        margin: theme.spacing.unit * 2
    },
    mapDiv: {
        width: "100%",
        height: "100%",
        boxSizing: "content-box",
        position: 'relative'
    },
    mapContainer: {
        width: "752px",
        height: "300px",
        boxSizing: "content-box",
        border: "2px black solid"
    },
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: "100%",
        [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
            overflowY: 'scroll'
        },
    },
    button: {
        margin: theme.spacing.unit
    },
})
class PrintModal extends React.Component {
    constructor(props) {
        super(props)
        const { token, urls, map } = this.props
        this.state = {
            title: "",
            comment: "",
            layout: "Landscape",
            dpi: 96,
            scale: ''
        }
        this.printModule = new PrintService(map, urls.geoserverUrl, token, urls.proxy)
        this.printModule.getPrintInfo().then(info => {
            const scales = this.printModule.getGeoserverScales()
            const initialScale = scales[Math.floor(scales.length / 2)]
            this.setState({ scale: initialScale, layout: this.printModule._getLayout().name })
        })
    }
    showBox = () => {
        const { scale, dpi, layout } = this.state
        const extent = this.printModule.getPolygonCoords(scale, dpi, layout)
        let f = this.printModule.getPolygonFeature(extent)
        this.printModule.addPrintLayer(f)
    }
    print = () => {
        const { title, comment, layout, dpi, scale } = this.state
        if (layout && dpi && scale) {
            this.printModule.createPDF(title, comment, layout, dpi, scale)
        }
    }
    handleChange = name => event => {
        const value = event.target.value
        if (name === "title" && value.length < 100) {
            this.setState({
                [name]: value,
            })
        }
        else if (name !== "title") {
            this.setState({
                [name]: value,
            })
        }
    }
    handleSelectChange = event => {
        const { value } = event.target
        const name = event.target.name
        this.setState({ [name]: value }, this.showBox)
    }
    render() {
        const { classes } = this.props
        let printInfo = this.printModule.pdfInfo
        return (
            <div>
                <div className={classes.modalContent}>
                    <TextField
                        id="title"
                        label="Title"
                        className={classes.textField}
                        value={this.state.title}
                        onChange={this.handleChange('title')}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        id="comment"
                        label="Comment"
                        multiline
                        rowsMax="4"
                        className={classes.textField}
                        value={this.state.comment}
                        onChange={this.handleChange('comment')}
                        margin="normal"
                        fullWidth
                    />
                    {printInfo && <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="print-layout">{"Layout"}</InputLabel>
                        <Select
                            classes={{ select: classes.fullWidth }}
                            value={this.state.layout}
                            onChange={this.handleSelectChange}
                            inputProps={{
                                name: 'layout',
                                id: 'print-layout',
                            }}
                        >
                            {printInfo && printInfo.layouts.map((layout, index) => <MenuItem key={index} value={layout.name}>{layout.name}</MenuItem>)}
                        </Select>
                    </FormControl>}
                    {printInfo && <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="print-layout">{"Scale"}</InputLabel>
                        <Select
                            classes={{ select: classes.fullWidth }}
                            value={this.state.scale}
                            onChange={this.handleSelectChange}
                            inputProps={{
                                name: 'scale',
                                id: 'print-scale',
                            }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {printInfo && printInfo.scales.map((scale, index) => <MenuItem key={index} value={Number(scale.value)}>{scale.name}</MenuItem>)}
                        </Select>
                    </FormControl>}
                    {printInfo && <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="print-layout">{"DPI"}</InputLabel>
                        <Select
                            classes={{ select: classes.fullWidth }}
                            value={this.state.dpi}
                            onChange={this.handleSelectChange}
                            inputProps={{
                                name: 'dpi',
                                id: 'print-dpi',
                            }}
                        >
                            {printInfo && printInfo.dpis.map((dpi, index) => <MenuItem key={index} value={Number(dpi.value)}>{dpi.name}</MenuItem>)}
                        </Select>
                    </FormControl>}
                </div>
                <Button onClick={this.showBox} color="primary">
                    {`Show Print Box`}
                </Button>
                <Button onClick={this.print} color="primary">
                    {`Print`}
                </Button>
                <Button onClick={() => this.printModule.removePrintLayer()} color="secondary" autoFocus>
                    {`Cancel`}
                </Button>
            </div>
        )
    }
}

PrintModal.propTypes = {
    token: PropTypes.string,
    map: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    urls: PropTypes.object.isRequired,
}

export default withStyles(styles)(PrintModal)