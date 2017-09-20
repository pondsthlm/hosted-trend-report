
import { div } from "../../../helpers/make-element";
import controlBar from "../control-bar/control-bar";
import adOverlay from "../ad-overlay/ad-overlay";

const className = "video-gui";

function guiDOM(state, dispatch) {
  return div(
    {
      className,
    },
    controlBar(state, dispatch),
    adOverlay(state, dispatch)
  );
}

function gui(state, dispatch) {
  const dom = guiDOM(state, dispatch);

  return dom;
}

export default gui;
