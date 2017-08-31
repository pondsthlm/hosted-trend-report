import {defaultVideoState} from "../../reducer";
import controlBar from "./control-bar.js";
import { div } from "../../../helpers/make-element";


//dom.querySelector("").click();

describe("Loding controlbar with defaltstate", () => {
  const state = Object.assign({}, defaultVideoState, {
    elementContainer: div()
  });
  const dispatches = [];

  function dispatchCallback(object) {
    dispatches.push(object);
  }
  const dom = controlBar(state, dispatchCallback);
  console.log("querySelector test", dom.querySelector("button").innerHTML);
  it("", (done) => {

  });
});
