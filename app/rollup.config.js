import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";

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
            browsers: ["ie >= 9"]
          },
          modules: false,
          debug: false
        }]
      ],
      plugins: ["external-helpers"]
    })
  ],
  dest: "public/bundle.js"
};
