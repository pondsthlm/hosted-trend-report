import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import uglify from "rollup-plugin-uglify";

const isProd = process.env.NODE_ENV === "production";
const suffix = isProd ? ".min" : "";

export default {
  entry: "app/main.js",
  format: "iife",
  moduleName: "ponyo",
  plugins: [
    commonjs(),
    resolve(),
    babel({
      exclude: "node_modules/**",
      babelrc: false,
      presets: [
        ["env", {
          targets: {
            browsers: ["ie >= 10"]
          },
          modules: false,
          debug: false
        }]
      ],
      plugins: ["external-helpers"]
    }),
    replace({
      "process.env.NODE_ENV": process.env.NODE_ENV
    }),
    isProd ? uglify() : () => {},
    filesize()
  ],
  dest: `public/assets/js/bundle${suffix}.js`
};
