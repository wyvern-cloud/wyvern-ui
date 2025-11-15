const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
			{
				test: /\.[jt]sx?$/,
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
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          filter: (resourcePath) => {
            // Exclude the index.html file from being copied
            return !resourcePath.endsWith('index.html');
          },
        },
        // { from: 'src/wyvrn/assets', to: 'assets' },
        // { from: 'src/wyvrn/manifest.json', to: 'manifest.json' },
        // { from: 'src/wyvrn/background.js', to: 'background.js' },
        // { from: 'src/wyvrn/content.js', to: 'content.js' },
        // { from: 'src/wyvrn/popup.js', to: 'popup.js' }
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
		new HtmlWebpackPlugin
		({
			//title:'My webpage!',
			filename: 'index.html',
			template: 'public/index.html'
		}),
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
