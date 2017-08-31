import {defaultVideoState} from "../../app/ui/reducer";
import controlBar from "../../app/ui/components/control-bar/control-bar";

const state = Object.assign({}, defaultVideoState, {
  isPlaying: true
});


function dispatchCallback(object) {
  dispatches.push(object);
}

const dom = controlBar(state, dispatchCallback);

//dom.querySelector("").click();

describe("Loding controlbar with defaltstate", () => {
  const dispatches = [];

  function dispatchCallback(object) {
    dispatches.push(object);
  }

  const dom = controlBar(state, dispatchCallback);
  it(`>${headline}< is replaced and with >${expected}< as title`, (done) => {

  });
});
