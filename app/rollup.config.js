import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

export default {
  entry: "app/main.js",
  format: "iife",
  moduleName: "ponyo",
  plugins: [
    commonjs(),
    resolve()
  ],
  dest: "public/bundle.js"
};
