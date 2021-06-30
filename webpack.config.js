const path = require('path');
const glob = require("glob")
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// HTML模板文件所在的文件夹
const htmlDir = path.join(__dirname, 'src/views')
// 入口文件所在文件夹
const srcDir = path.join(__dirname, 'src/views')


/** 扫描获取入口 */
function scanEntry() {
    let entry = {};
    glob.sync(srcDir + '/**/index.js').forEach(name => {
        name = path.normalize(name)
        const chunkName = name.replace(srcDir, '').replace(/\\/g, '').replace('index.js', '')
        entry[chunkName] = name
    });
    return entry
}


console.log(scanEntry())

/** 扫描获取所有HTML模板 */
function scanHtmlTemplate() {
    let htmlEntry = {}
    glob.sync(htmlDir + '/**/index.html').forEach(name => {
        name = path.normalize(name)
        const chunkName = name.replace(htmlDir, '').replace(/\\/g, '').replace('index.html', '')
        htmlEntry[chunkName] = name
    });
    return htmlEntry
}


/** 构建HtmlWebpackPlugin 对象 */
function buildHtmlWebpackPlugins() {
    const tpl = scanHtmlTemplate()
    const chunkFilenames = Object.keys(tpl)
    return chunkFilenames.map(item => {
        let conf = {
            filename: item + "/index.html",
            template: tpl[item],
            inject: true,
            //favicon: path.resolve('./public/favicon.ico'),
            chunks: [item]
        };
        console.log(conf)
        return new HtmlWebpackPlugin(conf)
    })
}

const plugins = [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
        filename: "assets/css/[name]_[hash].css",//输出目录与文件
    }),
    new CssMinimizerPlugin(),
].concat(buildHtmlWebpackPlugins());

console.log(plugins)


module.exports = {
    mode: 'development',
    entry: scanEntry(),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'assets/js/[name]-[chunkhash].js', //存放到path指定的目录下
        publicPath: '/'
    },
    devServer: {
        contentBase: './dist',
        port: 9001,
    },
    plugins,
    module: {
        rules: [
            {
                test: /\.(le|c)ss$/,
                use: [

                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                strictMath: true,
                            },
                        },
                    },
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/, //匹配图片文件
                loader: 'url-loader',
                options: {
                    limit: 10 * 1024,//小于limit限制的图片将转为base64嵌入引用位置, 单位为字节(byte)
                    fallback: 'file-loader',//大于limit限制的将转交给指定的file-loader处理
                    outputPath: 'assets/img'//传入file-loader将图片输出到 dist/assets/img文件夹下
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'assets/media/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'assets/fonts/[name].[hash:7].[ext]'
                }
            }
        ]
    }
};
