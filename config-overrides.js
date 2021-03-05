const CopyWebpackPlugin = require('copy-webpack-plugin');

const getLocalConfigIfExists = () => {
  try {
    require('./src/config/config.local.json');
    return 'src/config/config.local.json';
  } catch (ex) {
    console.warn("No local config file found");
    return 'src/config/config.json';
  }
}

module.exports = function override(config, env) {
  const configPath = process.env.NODE_ENV === 'development' ? getLocalConfigIfExists() : 'src/config/config.json';
  config.plugins.push(new CopyWebpackPlugin(
    {
      patterns: [
        { from: configPath, to: 'config.json', toType: 'file' }
      ]
    },
    {}
  ));
  return config;
};
