import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import css from "rollup-plugin-css-porter";
import filesize from "rollup-plugin-filesize";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import stylus from "rollup-plugin-stylus-compiler";
import uglify from "rollup-plugin-uglify";

const isProd = process.env.NODE_ENV === "production";
const suffix = isProd ? ".min" : "";

export default {
  entry: "app/main.js",
  format: "iife",
  moduleName: "ponyo",
  plugins: [
    stylus(),
    css({dest: "public/assets/bundle.css"}),
    commonjs(),
    resolve(),
    babel({
      exclude: "node_modules/**",
      babelrc: false,
      presets: [
        ["env", {
          targets: {
            browsers: ["ie >= 9"]
          },
          modules: false,
          debug: false
        }]
      ],
      plugins: ["syntax-object-rest-spread", "transform-object-rest-spread", "external-helpers"]
    }),
    isProd ? () => {} : replace({
      "process.env.NODE_ENV": process.env.NODE_ENV
    }),
    isProd ? uglify() : () => {},
    filesize()
  ],
  dest: `public/assets/bundle${suffix}.js`
};
