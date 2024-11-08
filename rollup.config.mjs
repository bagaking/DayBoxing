import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs.js',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src'
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      preferBuiltins: true,
      resolveOnly: [/^(?!babel-plugin-styled-components)/]
    }),
    commonjs({
      include: /node_modules/
    }),
    babel({
      babelHelpers: 'bundled',
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
      plugins: [
        [
          'babel-plugin-styled-components',
          {
            ssr: false,
            displayName: true,
            fileName: false
          }
        ]
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: 'node_modules/**'
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
      exclude: ['example/**/*']
    }),
    terser()
  ],
  external: ['react', 'react-dom', 'styled-components']
}; 