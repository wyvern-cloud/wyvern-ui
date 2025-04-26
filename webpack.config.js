const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
			{
				test: /\.jsx?$/,
				exclude: /\/node_modules\//,
				use: {
					loader: "babel-loader",
				},
			},
      {
        test: /\/src\/.+\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							modules: {
								namedExport: false
							},
						},
					},
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  // Add other PostCSS plugins here if needed
                  process.env.NODE_ENV === 'production' ? require('@fullhuman/postcss-purgecss')({
                    content: [
                      path.resolve(__dirname, 'src/**/*.html'), // Your templates
                      path.resolve(__dirname, 'src/**/*.js')    // Your scripts
                    ],
                    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
                  }) : null
                ].filter(Boolean)
              }
            }
          }
        ]
      },
      {
        test: /\.md$/,
        use: ['html-loader', 'markdown-loader']
      }
    ],
  },
	devtool: 'inline-source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
		new HtmlWebpackPlugin
		({
			//title:'My webpage!',
			filename: 'index.html',
			template: 'public/index.html'
		})
  ],
  resolve: {
    extensions: ['.ts', '.js', '.jsx', '.tsx'],
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
		clean: true,
  },
  devtool: 'source-map',
  experiments: {
    asyncWebAssembly: true
  },
  mode: 'development',
  devServer: {
    compress: true,
    port: 9000
  }
};
