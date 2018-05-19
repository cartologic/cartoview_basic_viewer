import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import PropTypes from 'prop-types'
import React from 'react'
import withMobileDialog from '@material-ui/core/withMobileDialog'

class CartoviewAbout extends React.Component {
    render() {
        const { fullScreen, title, abstract, close, open } = this.props

        return (
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={close}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {abstract}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close} color="primary">
                        {"Close"}
                    </Button>

                </DialogActions>
            </Dialog>
        )
    }
}

CartoviewAbout.propTypes = {
    fullScreen: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    abstract: PropTypes.string,
    close: PropTypes.func.isRequired
}

export default withMobileDialog()(CartoviewAbout)