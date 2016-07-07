import path from 'path'

const library = 'style-script'
const srcPath = path.resolve(__dirname, 'src')
const libPath = path.resolve(__dirname, 'lib')

export default {
  devtool: 'source-map',

  context: srcPath,

  entry: 'index.js',

  resolve: {
    root: srcPath,
  },

  output: {
    library,
    libraryTarget: 'commonjs2',
    filename: `${ library }.js`,
    path: libPath,
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        include: srcPath,
        loader: 'babel',
      },
    ],
  },
}
