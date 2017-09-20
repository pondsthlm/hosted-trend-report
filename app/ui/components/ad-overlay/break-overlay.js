
import { div } from "../../../helpers/make-element";
import countdown from "./countdown";

import "./break-overlay.styl";

const className = "break-overlay";

function breakOverlayDOM(state, dispatch) {
  let flag = "--hide";
  if (state.display === "preroll" || state.display === "postroll") {
    flag = "";
  }
  return div(
    {
      className: `${className}${flag}`,
    },
    countdown(state, dispatch)
  );
}

function breakOverlay(state, dispatch) {
  const dom = breakOverlayDOM(state, dispatch);
  dom.update((newState) => {
    let flag = "--hide";
    if (newState.display === "preroll" || newState.display === "postroll") {
      flag = "";
    }

    return {className: `${className}${flag}`};

  });
  return dom;
}

export default breakOverlay;
