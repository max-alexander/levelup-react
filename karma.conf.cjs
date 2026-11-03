// Configuración del entorno de pruebas: Karma (runner) + Jasmine (framework)
// Webpack + Babel transpilan JSX; babel-plugin-istanbul instrumenta el código para la cobertura.
const path = require('path');
const webpack = require('webpack');

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'webpack'],
    files: [
      { pattern: 'src/test/index.spec.js', watched: false },
      { pattern: 'public/assets/**/*', included: false, served: true, watched: false }
    ],
    proxies: { '/assets/': '/base/public/assets/' },
    preprocessors: { 'src/test/index.spec.js': ['webpack'] },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx'] },
      // React.lazy genera chunks aparte; en pruebas se empaquetan en un solo bundle.
      plugins: [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })],
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            resolve: { fullySpecified: false }, // permite imports sin extensión ("type": "module")
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: 'last 2 Chrome versions' }],
                  ['@babel/preset-react', { runtime: 'automatic' }]
                ],
                plugins: [['istanbul', { exclude: ['**/*.spec.js', '**/*.spec.jsx', 'src/test/**'] }]]
              }
            }
          },
        ]
      }
    },

    reporters: ['spec', 'kjhtml', 'coverage'],
    specReporter: { suppressSkipped: true, showSpecTiming: true },
    coverageReporter: {
      dir: path.join(__dirname, 'coverage'),
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'text', subdir: '.', file: 'coverage.txt' },
        { type: 'json-summary', subdir: '.', file: 'coverage-summary.json' }
      ],
      check: { global: { statements: 70, branches: 55, functions: 65, lines: 70 } }
    },

    browsers: ['ChromeHeadless'],
    client: { jasmine: { random: false }, clearContext: false },
    singleRun: false,
    restartOnFileChange: true
  });
};
