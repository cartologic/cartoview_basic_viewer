import Control from 'ol/control/control'
import ol from 'ol'

export default class ScaleZoom {
    constructor(scales = [], printService = null) {
        this.scales = scales
        this.printService = printService
        this.currentScaleIndex = 0
    }
    _create_control() {
        let that = this
        const customScaleZoom = (opt_options) => {

            let options = opt_options || {}

            let buttonIn = document.createElement('button')
            buttonIn.innerHTML = '+'

            let buttonOut = document.createElement('button')
            buttonOut.innerHTML = '-'

            let this_ = this
            let handleRotateNorth = () => {
                if (this.scales.length > 0 && this.printService) {
                    this_.getMap().getView().getResolution()
                }
            }

            buttonIn.addEventListener('click', handleRotateNorth, false)
            buttonIn.addEventListener('touchstart', handleRotateNorth, false)

            buttonOut.addEventListener('click', handleRotateNorth, false)
            buttonOut.addEventListener('touchstart', handleRotateNorth, false)

            let element = document.createElement('div')
            element.className = 'rotate-north ol-unselectable ol-control'
            element.appendChild(buttonIn)

            ol.control.Control.call(this, {
                element: element,
                target: options.target
            })

        }
        ol.inherits(customScaleZoom, Control)
        return customScaleZoom
    }
    getControl() {
        if (this.scales) {
            return this._create_control()
        }
        return null
    }
}