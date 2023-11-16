// eslint-disable-next-line no-undef
module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@modules': './modules',
            app: './src/app',
            entities: './src/entities',
            features: './src/features',
            pages: './src/pages',
            shared: './src/shared',
            widgets: './src/widgets',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          root: ['./src/'],
        },
      ],
    ],
    presets: ['babel-preset-expo'],
  };
};
