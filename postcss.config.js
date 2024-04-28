module.exports = ({ env }) => ({
  plugins: [
    'tailwindcss',
    'postcss-preset-env',
    'autoprefixer',
    env === 'production' ? 'cssnano' : '',
  ],
});
