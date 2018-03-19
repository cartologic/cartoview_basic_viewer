var webpack = require( 'webpack' )
var CompressionPlugin = require( "compression-webpack-plugin" )
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' )
var ExtractTextPlugin = require( "extract-text-webpack-plugin" );
var path = require( 'path' )
var BUILD_DIR = path.resolve( __dirname, 'dist' )
var APP_DIR = path.resolve( __dirname, 'src' )
var filename = '[name].bundle.js'
const production = process.argv.indexOf( '-p' ) !== -1
const plugins = [
    new webpack.DefinePlugin( {
        'process.env': {
            'NODE_ENV': JSON.stringify( production ? 'production' : '' )
        },
    } ),
    new webpack.optimize.CommonsChunkPlugin( {
        name: 'commons',
        filename: 'commons.js'
    } ),
    new ExtractTextPlugin( "[name].css" )

]
const config = {
    entry: {
        config: path.join( APP_DIR, 'EditPageEntry.jsx' ),
        BasicViewer: path.join( APP_DIR, 'containers', 'BasicViewer.jsx' ),
    },
    output: {
        path: BUILD_DIR,
        filename: filename,
        library: '[name]',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        chunkFilename: '[name]-chunk.js',
        publicPath: "/static/cartoview_basic_viewer/"
    },
    node: {
        fs: "empty"
    },
    plugins: plugins,
    resolve: {
        extensions: [ '*', '.js', '.jsx' ],
        alias: {
            Source: APP_DIR
        },
    },
    module: {
        loaders: [ {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/
        },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract( {
                    use: 'css-loader',
                    fallback: 'style-loader'
                } )
        },
            {
                test: /\.xml$/,
                loader: 'raw-loader'
        },
            {
                test: /\.json$/,
                loader: "json-loader"
        },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader'
        },
            {
                test: /\.(woff|woff2)$/,
                loader: 'url-loader?limit=100000'
        }
        ],
        noParse: [ /dist\/ol\.js/, /dist\/jspdf.debug\.js/,
            /dist\/js\/tether\.js/ ]
    }
}
if ( production ) {
    const prodPlugins = [
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new UglifyJsPlugin( {
            uglifyOptions: {
                ecma: 6,
                compress: {
                    warnings: false,
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true
                },
                output: {
                    comments: false,
                    beautify: false
                },
                ie8: true,
                exclude: [ /\.min\.js$/gi ]
            }
        } ),
        new CompressionPlugin( {
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
            threshold: 10240,
            minRatio: 0
        } ),
        new webpack.HashedModuleIdsPlugin(),
    ]
    Array.prototype.push.apply( plugins, prodPlugins )
} else {
    config.devtool = 'eval-cheap-module-source-map'
}
module.exports = config
