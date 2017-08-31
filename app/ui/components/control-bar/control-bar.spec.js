import {defaultVideoState} from "../../reducer";
import controlBar from "./control-bar";
import play from "./play";
import { div } from "../../../helpers/make-element";
import assert from "assert";

// Default state needs an element.
defaultVideoState.elementContainer = div();

describe("Loading controlbar with default state", () => {
  const state = defaultVideoState;
  const dom = controlBar(state);

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

describe("Loading play with default state", () => {
  const state = defaultVideoState;
  const dispatches = [];

  function dispatchCallback(object) {
    dispatches.push(object);
  }

  const dom = play(state, dispatchCallback);
  it("should have a dispatch play when clicked", () => {
    dispatches.length.should.equal(0);
    dom.click();
    dispatches.length.should.equal(1);
    dispatches[0].type.should.equal("PLAY");
  });
});

describe("Loading play with isPLaying state", () => {
  const state = Object.assign({}, defaultVideoState, {
    isPlaying: true
  });
  const dispatches = [];

  function dispatchCallback(object) {
    dispatches.push(object);
  }

  const dom = play(state, dispatchCallback);
  it("should have a dispatch pause when clicked", () => {
    dispatches.length.should.equal(0);
    dom.click();
    dispatches.length.should.equal(1);
    dispatches[0].type.should.equal("PAUSE");
  });
});
