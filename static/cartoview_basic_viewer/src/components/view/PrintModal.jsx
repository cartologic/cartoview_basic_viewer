import AddIcon from '@material-ui/icons/Add'
import BasicViewerHelper from 'cartoview-sdk/helpers/BasicViewerHelper'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import PrintService from 'cartoview-sdk/services/PrintService'
import PropTypes from 'prop-types'
import React from 'react'
import RemoveIcon from '@material-ui/icons/Remove'
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
    zoomButtons: {
        zIndex: '12123',
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column'
    }
})
class PrintModal extends React.Component {
    constructor(props) {
        super(props)
        const { token, urls, } = this.props
        this.state = {
            title: "",
            comment: "",
            layout: "Landscape",
            dpi: 96,
            scale: '',
            map: BasicViewerHelper.getPrintMap()
        }
        this.printModule = new PrintService(this.state.map, urls.geoserverUrl, token, urls.proxy)
    }
    print = () => {
        const { title, comment, layout, dpi, scale } = this.state
        if (layout && dpi && scale) {
            this.printModule.createPDF(title, comment, layout, dpi, scale)
        }
    }
    getScaleValues = () => {
        let scaleValues = []
        if (this.printModule.pdfInfo && this.printModule.pdfInfo.scales.length > 0) {
            this.printModule.pdfInfo.scales.map(scale => {
                scaleValues.push(Number(scale.value))
            })
        }
        return scaleValues
    }
    handleZoomOut = () => {
        const scaleValues = this.getScaleValues()
        const { dpi, map } = this.state
        let currentScale = this.printModule.getScaleFromResolution(null, dpi)
        currentScale = this.printModule.getClosestScale(currentScale)
        let currentScaleIndex = scaleValues.indexOf(currentScale)
        if (currentScaleIndex < scaleValues.length - 1) {
            let nextScale = scaleValues[++currentScaleIndex]
            this.setState({ scale: nextScale })
            let res = this.printModule.getResolutionFromScale(nextScale, dpi)
            map.getView().setResolution(res)
        }
    }
    handleZoomIn = () => {
        const scaleValues = this.getScaleValues()
        const { dpi, map } = this.state
        let currentScale = this.printModule.getScaleFromResolution(null, dpi)
        currentScale = this.printModule.getClosestScale(currentScale)
        let currentScaleIndex = scaleValues.indexOf(currentScale)
        if (currentScaleIndex > 0) {
            let prevScale = scaleValues[--currentScaleIndex]
            this.setState({ scale: prevScale })
            let res = this.printModule.getResolutionFromScale(prevScale, dpi)
            map.getView().setResolution(res)
        }
    }
    componentWillMount() {
        const { urls, token } = this.props
        let { map } = this.state
        BasicViewerHelper.mapInit(urls.mapJsonUrl, map, urls.proxy, token, () => {
            //TODO: better handling for default scale
            this.printModule.getPrintInfo().then((info) => {
                let currentScale = info.scales[Math.floor(info.scales.length / 2)]
                currentScale = Number(currentScale.value)
                const res = this.printModule.getResolutionFromScale(currentScale, this.state.dpi)
                this.setState({ scale: currentScale })
                this.state.map.getView().setResolution(res)
            })

        })
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
    showMap = () => {
        let { map } = this.state
        map.setTarget(this.mapDiv)
        map.updateSize()
    }
    handleSelectChange = event => {
        const { value } = event.target
        const name = event.target.name
        this.setState({ [name]: value })
    }
    render() {
        const { classes, handlePrintModal } = this.props
        let printInfo = this.printModule.pdfInfo
        return (
            <div>
                <Dialog
                    fullScreen
                    open={this.props.opened}
                    onClose={this.handleClose}
                    aria-labelledby="print-modal"
                    onEntered={this.showMap}
                >
                    <DialogTitle id="print-modal">{"Print Composer"}</DialogTitle>
                    <DialogContent className={classes.root}>
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
                                    disabled
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
                        <div className={classes.mapContainer}>
                            <div className={classes.mapDiv} ref={(divRef) => this.mapDiv = divRef}>
                                <div className={classes.zoomButtons}>
                                    <Button onClick={this.handleZoomIn} variant="fab" mini color="secondary" aria-label="add" className={classes.button}>
                                        <AddIcon />
                                    </Button>
                                    <Button onClick={this.handleZoomOut} variant="fab" mini color="secondary" aria-label="add" className={classes.button}>
                                        <RemoveIcon />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.print} color="primary">
                            {`Print`}
                        </Button>
                        <Button onClick={handlePrintModal} color="secondary" autoFocus>
                            {`Cancel`}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

PrintModal.propTypes = {
    opened: PropTypes.bool.isRequired,
    token: PropTypes.string,
    handlePrintModal: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    urls: PropTypes.object.isRequired,
}

export default withStyles(styles)(PrintModal)