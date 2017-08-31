import {defaultVideoState} from "../../reducer";
import controlBar from "./control-bar.js";
import { div } from "../../../helpers/make-element";
import assert from "assert";


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

  it("the className should be control-bar", () => {
    dom.className.should.equal("control-bar");
  });

  it("should have four components", () => {
    dom.children.length.should.equal(4);
  });

  it("the components should have the right bem parent className", () => {
    [].forEach.call(dom.children, (componentNode) => {
      assert.equal(true, componentNode.className.startsWith("control-bar"));
    });
  });
});
