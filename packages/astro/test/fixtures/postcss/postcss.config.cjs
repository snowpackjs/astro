const postcssPresetEnv = require('postcss-preset-env')
const autoPrefixer = require('autoprefixer')

module.exports = {
  plugins: [
		// included to ensure public/ CSS resources are NOT transformed
		autoPrefixer({
      overrideBrowserslist: ['> 0.1%', 'IE 11'] // enforce `appearance: none;` is prefixed with -webkit and -moz
    }),
    postcssPresetEnv({ features: { 'nesting-rules': true } }),
  ]
}
