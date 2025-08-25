module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
          node: '18'
        },
        modules: false,
        useBuiltIns: 'usage',
        corejs: 3,
        // Ensure async/await is properly transpiled
        include: [
          '@babel/plugin-transform-async-to-generator',
          '@babel/plugin-transform-regenerator'
        ]
      }
    ],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-transform-regenerator'
  ],
  env: {
    production: {
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-transform-async-to-generator',
        '@babel/plugin-transform-regenerator'
      ]
    }
  }
};
