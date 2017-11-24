import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import css from 'rollup-plugin-css-porter';
import filesize from 'rollup-plugin-filesize';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import stylus from 'rollup-plugin-stylus-compiler';
import uglify from 'rollup-plugin-uglify';

import fs from 'fs';

const copyPlugin = function (options) {
  return {
    ongenerate() {
      copy(options.src, options.targ);
      function copy(srcDir, dstDir) {
        let results = [];
        const list = fs.readdirSync(srcDir);
        let src;
        let dst;
        list.forEach((file) => {
          src = `${srcDir}/${file}`;
          dst = `${dstDir}/${file}`;
          const stat = fs.statSync(src);
          if (stat && stat.isDirectory()) {
            try {
              console.log('creating dir: ', dst);
              fs.mkdirSync(dst);
            } catch (e) {
              console.log('directory already exists: ', dst);
            }
            results = results.concat(copy(src, dst));
          } else {
            try {
              console.log('copying file:', src, '-to->', dst);
              fs.writeFileSync(dst, fs.readFileSync(src));
            } catch (e) {
              console.log('could\'t copy file:', src, e);
            }
            results.push(src);
          }
        });
        return results;
      }
    }
  };
};

const isProd = process.env.NODE_ENV === 'production';
const suffix = isProd ? '.min' : '';

export default {
  entry: 'app/main.js',
  format: 'iife',
  moduleName: 'ponyo',
  plugins: [
    stylus(),
    css({dest: 'public/assets/bundle.css'}),
    copyPlugin({
      src: 'app/static',
      targ: 'public/assets'
    }),
    commonjs(),
    resolve(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [
        ['env', {
          targets: {
            browsers: ['ie >= 9']
          },
          modules: false,
          debug: false
        }]
      ],
      plugins: [['transform-react-jsx', {
        'pragma': 'transpileJSX'
      }], 'syntax-object-rest-spread', 'transform-object-rest-spread', 'external-helpers']
    }),
    isProd ? () => {} : replace({
      'process.env.NODE_ENV': process.env.NODE_ENV
    }),
    isProd ? uglify() : () => {},
    filesize()
  ],
  dest: `public/assets/bundle${suffix}.js`
};
