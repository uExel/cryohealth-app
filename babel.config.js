// Required by WatermelonDB's `@field`/`@json`/`@date` model decorators (src/lib/db/models/).
// Legacy decorators only work on class properties Babel itself compiles (loose mode). On
// Hermes, babel-preset-expo leaves class fields native, so every decorated field became an
// `_initializerWarningHelper` call that threw the moment a model was constructed -- every
// sync write failed with "Decorating class property failed" and the local cache stayed
// empty. The class-properties transform is scoped to the model files: enabling it globally
// also forces private-methods handling onto react-native's own sources and breaks the bundle.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
    overrides: [
      {
        // A function, not a RegExp: Metro loads this config once with no filename, and
        // Babel rejects pattern-based `test` in that case.
        test: (filename) => !!filename && /src[\\/]lib[\\/]db[\\/]models[\\/]/.test(filename),
        plugins: [['@babel/plugin-transform-class-properties', { loose: true }]],
      },
    ],
  };
};
