import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';

const createConfig = (packageName) => ({
  input: `packages/${packageName}/src/index.ts`,
  external: ['react', 'react-dom'],
  output: [
    {
      file: `packages/${packageName}/dist/index.js`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: `packages/${packageName}/dist/index.esm.js`,
      format: 'esm',
      sourcemap: true,
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: `packages/${packageName}/tsconfig.json`,
      declaration: true,
      declarationDir: `packages/${packageName}/dist`,
      rootDir: `packages/${packageName}/src`
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.ts', '.tsx']
    })
  ]
});

export default [
  createConfig('tree-navigation'),
  createConfig('command-input'),
  createConfig('indented-text-parser')
];