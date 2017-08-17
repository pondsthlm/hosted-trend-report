import foo from "./foo.js";
import { combineReducers } from "redux";

function x() {
  return Promise.resolve(5);
}

async function y() {
  await x();
}

export default function () {
  combineReducers({});
  y().then(() => console.log(foo));
}
