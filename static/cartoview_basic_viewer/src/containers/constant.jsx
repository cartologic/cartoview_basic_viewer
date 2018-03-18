export const getPrintTemplate = (map) => {
    const projection = map.getView().getProjection()
    const projectionCode = projection.getCode()
    const units = projection.getUnits()
    const print = `
                    {
                        layout: 'A4 portrait',
                        srs: '${projectionCode}',
                        units: '${units}',
                        geodetic: false,
                        outputFilename: 'print.pdf,
                        outputFormat: 'pdf',
                        layers: [
                            {
                                type: 'WMS',
                                layers: ['basic'],
                                baseURL: 'http://labs.metacarta.com/wms/vmap0',
                                format: 'image/png'
                            }
                        ],
                        pages: [
                            {
                                center: [6, 45.5],
                                scale: 4000000,
                                dpi: 190,
                                geodetic: false,
                                strictEpsg4326: false,
                            }
                        ],
                        legends: [
                            {
                                classes: [
                                    {
                                        icons: [
                                            'full url to the image'
                                        ],
                                        name: 'an icon name',
                                        iconBeforeName: true
                                    }
                                ],
                                name: 'a class name'
                            }
                        ]
                    }
                `
    return print
}