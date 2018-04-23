import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
    withMobileDialog,
} from 'material-ui/Dialog'

import Button from 'material-ui/Button'
import { FormControl } from 'material-ui/Form'
import { InputLabel } from 'material-ui/Input'
import { MenuItem } from 'material-ui/Menu'
import PropTypes from 'prop-types'
import React from 'react'
import Select from 'material-ui/Select'
import TextField from 'material-ui/TextField'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    menu: {
        width: 200,
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    modalContent: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    }
})
class PrintModal extends React.Component {
    state = {
        title: "",
        comment: "",
        layout: "A4",
        dpi: 96
    }
    componentWillReceiveProps(nextProps) {
        const { printInfo } = this.props
        if (nextProps && (printInfo !== nextProps.printInfo)) {
            const dpi = Number(nextProps.printInfo.dpis[0].value)
            const layout = nextProps.printInfo.layouts[0].name
            this.setState({ dpi, layout })
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
        this.setState({ [event.target.name]: event.target.value })
    }
    render() {
        const { fullScreen, classes, handlePrintModal, print, printInfo } = this.props
        return (
            <div>
                <Dialog
                    fullScreen={fullScreen}
                    open={this.props.opened}
                    onClose={this.handleClose}
                    aria-labelledby="print-modal"
                >
                    <DialogTitle id="print-modal">{"Print"}</DialogTitle>
                    <DialogContent>
                        <div className={classes.modalContent}>
                            <TextField
                                id="title"
                                label="Title"
                                className={classes.textField}
                                value={this.state.title}
                                onChange={this.handleChange('title')}
                                margin="normal"
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
                            />
                            {printInfo && <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="print-layout">{"Layout"}</InputLabel>
                                <Select
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
                                <InputLabel htmlFor="print-layout">{"DPI"}</InputLabel>
                                <Select
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
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { print(this.state.title, this.state.comment, this.state.layout, this.state.dpi) }} color="primary">
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
    fullScreen: PropTypes.bool.isRequired,
    opened: PropTypes.bool.isRequired,
    print: PropTypes.func.isRequired,
    handlePrintModal: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    printInfo: PropTypes.object
}

export default withMobileDialog()(withStyles(styles)(PrintModal))