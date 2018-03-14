export const print = `
    {
        layout: 'A4 portrait',
        ...CUSTOM_PARAMS...
        srs: 'EPSG:4326',
        units: 'degrees',
        geodetic: false,
        outputFilename: 'political-boundaries',
        outputFormat: 'pdf',
        layers: [
            {
                type: 'WMS',
                layers: ['basic'],
                baseURL: 'http://labs.metacarta.com/wms/vmap0',
                format: 'image/jpeg'
            }
        ],
        pages: [
            {
                center: [6, 45.5],
                scale: 4000000,
                dpi: 190,
                geodetic: false,
                strictEpsg4326: false,
                ...CUSTOM_PARAMS...
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