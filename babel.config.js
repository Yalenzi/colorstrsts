module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
    }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      corejs: false,
      helpers: true,
      useESModules: false,
    }],
  ],
  env: {
    production: {
      plugins: [
        ['@babel/plugin-transform-runtime', {
          regenerator: true,
          corejs: false,
          helpers: true,
          useESModules: false,
        }],
      ],
    },
  },
};
