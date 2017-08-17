import foo from "./foo.js";
import { combineReducers } from "redux";

export default function () {
  combineReducers({});
  console.log(foo);
}
