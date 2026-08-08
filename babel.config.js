// Required by WatermelonDB's `@field`/`@json`/`@date` model decorators (src/lib/db/models/).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
  };
};
