
import { div } from "../../../helpers/make-element";
import pauseAd from "./pause-ad";
import breakOverlay from "./break-overlay";

const className = "oo-overlay";

function adOverlayDOM(state, dispatch) {
  return div(
    {
      className,
    },
    pauseAd(state, dispatch),
    breakOverlay(state, dispatch)
  );
}

function adOverlay(state, dispatch) {
  const dom = adOverlayDOM(state, dispatch);

  return dom;
}

export default adOverlay;
