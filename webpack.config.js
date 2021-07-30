const path = require('path');
const webpack = require('webpack')
//const nodeExternals = require('webpack-node-externals');
const pkg = require('./package.json')

const env = ['@babel/preset-env', {
    "targets": "defaults"
}]
//unlike object, array prints without requiring a field
const plugins = {
    "plugins": [
        ["@babel/plugin-proposal-class-properties",
            {
                include: path.resolve(__dirname, 'src', 'index.js'),
                exclude: /(node_modules)/
            }]
    ]
}
module.exports = {
    target: 'node',
    devtool: false,
    resolve: {
        extensions: ['*', '.js'],
        modules: ['node_modules'],
        alias: {
            'react': path.resolve(__dirname, './node_modules/react'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        }
    },
    externals: {
        react: {
            commonjs: "react",
            commonjs2: "react",
            amd: "React",
            root: "React"
        },
        "react-dom": {
            commonjs: "react-dom",
            commonjs2: "react-dom",
            amd: "ReactDOM",
            root: "ReactDOM"
        }
    },
    mode: 'production',
    entry: {//PATH TO YOUR INDEX.JSX FILE
        [pkg.name]: path.resolve(__dirname, 'src', 'index.js')
    },
    output: {
        //PATH TO SEND BUNDLED/TRANSPILED CODE
        path: path.resolve(__dirname, "dist"),
        filename: 'bundle.js'
    },
    plugins: [
        new htmlWebpackPlugin({
            template: path.resolve(__dirname, "dist"),
            filename: 'bundle.js',
            hash: true,
            inject: "body"
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(jsx|js)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [env, '@babel/preset-react', plugins]
                    }
                }
            },
        ],
    },
    performance: {
        maxEntrypointSize: 750000,
        maxAssetSize: 750000,
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false,
                    },
                },
            }),
        ],
    },
}
//moved webpack to devDependencies without presets but in config

/**
 * const path = require('path');
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals');
const pkg = require('./package.json')

module.exports = {
    target: 'node',
    devtool: false,
    resolve: {
        extensions: ['*', '.js'],
        modules: ['node_modules'],
        alias: {
            'react': path.resolve(__dirname, './node_modules/react'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        }
    },
    externals: {/*
        react: 'React',
        'react-dom': 'ReactDOM',*
        // Don't bundle react or react-dom
        react: {
            commonjs: "react",
            commonjs2: "react",
            amd: "React",
            root: "React"
        },
        "react-dom": {
            commonjs: "react-dom",
            commonjs2: "react-dom",
            amd: "ReactDOM",
            root: "ReactDOM"
        },
        //[nodeExternals]()
    },
    mode: 'production',
    entry: {//PATH TO YOUR INDEX.JSX FILE
        [pkg.name]: path.resolve(__dirname, './src'),
    },
    output: {
        //libraryTarget: 'src',
        //library: 'localPhoto',
        //publicPath: '/',
        //pathinfo: true,
        //libraryTarget: 'commonjs2',
        //PATH TO SEND BUNDLED/TRANSPILED CODE
        path: path.resolve(__dirname, "./public"),
        filename: 'index.html',
    },
    plugins: [
        /*new htmlWebpackPlugin({
            template: './dist/index.html',
            filename: 'index.html',
            hash: true,
            inject: "body"
        }),*
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],
    module: {
        loaders: [
            {
                //include: './src',
                test: /\.js?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', {
                            "targets": "defaults"
                        }], ['@babel/preset-react', {
                            "targets": "defaults"
                        }], {
                            'plugins': [
                                ["@babel/plugin-proposal-class-properties",
                                    {
                                        //loose: true,
                                        include: './src',
                                        exclude: /(node_modules)/
                                    }]
                            ]
                        }],
                        //presets: ['env', 'react']
                    }
                }
            },
        ],
    },
    performance: {
        maxEntrypointSize: 750000,
        maxAssetSize: 750000,
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false,
                    },
                },
            }),
        ],
    },
}
//moved webpack to devDependencies without presets but in config
 */