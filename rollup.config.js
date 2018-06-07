import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/index.ts',
  output: {
    name: "HtmlInlineCSSWebpackPlugin",
    file: 'index.js',
    format: 'umd',
  },
  plugins: [typescript()],
}