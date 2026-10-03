module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
            '@api': './src/api',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@context': './src/context',
            '@utils': './src/utils',
          },
        },
      ],
    ],
  };
};
