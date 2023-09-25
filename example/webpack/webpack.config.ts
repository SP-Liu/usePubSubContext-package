import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { Configuration } from 'webpack';
const isProd = process.env.NODE_ENV === 'production';

export default merge<Configuration>({
  entry: {
    index: './src/index.tsx',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  output: {
    path: path.resolve(__dirname, '../dist/'),
    clean: true,
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    loose: true,
                    targets: {
                      chrome: '60',
                      ios: '7',
                    },
                  },
                ],
                ['@babel/preset-typescript'],
                ['@babel/preset-react', {
                  "runtime": "automatic"
                }],
              ],
            },
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'css-unicode-loader',
          'sass-loader',
        ],
      },
      { test: /\.txt$/, use: 'raw-loader' },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      filename: 'index.html',
      chunks: ['index'],
    }),
    new MiniCssExtractPlugin({
      filename: isProd ? 'css/[name].[contenthash:8].css' : '[name].css',
    }),
  ],
});
