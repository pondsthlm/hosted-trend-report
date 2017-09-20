
import { div } from "../../../helpers/make-element";
import playPause from "../control-bar/play-pause";

import "./pause-overlay.styl";

const className = "pause-overlay";

function pauseAdDOM(state, dispatch) {
  let flag = "";
  if (state.display !== "pause-ad") {
    flag = "--hide";
  }
  return div(
    {
      className: `${className}${flag}`,
    },
    playPause(state, dispatch, className)
  );
}

function pauseAd(state, dispatch) {
  const dom = pauseAdDOM(state, dispatch);
  dom.update((newState) => {
    let flag = "";
    console.log(newState.display);
    if (newState.display !== "pause-ad") {
      flag = "--hide";
    }

    return {className: `${className}${flag}`};

  });
  return dom;
}

export default pauseAd;
