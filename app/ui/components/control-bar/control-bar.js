
import { div } from "../../../helpers/make-element";
import logger from "../../../logger";
import play from "./play";
import "./control-bar.styl";
import volume from "./volume";
import progressBar from "./progress-bar";
import fullscreenButton from "./fullscreen";

const className = "control-bar";

function getControls(state, dispatch) {
  return div(
    {
      className,
    },
    play(state, dispatch, className),
    volume(state, dispatch, className),
    progressBar(state, dispatch, className),
    fullscreenButton(state, dispatch, className)
  );
}

function controlBar(state, dispatch) {
  if (!state.elementContainer ) {
    logger.error("Video is missing elementContainer");
    return;
  }

  let root = state.elementContainer.querySelector(`.${className}`);
  if (!root) {
    root = state.elementContainer.appendChild(div({className}, ""));
  }


  if (!state.showControls) {
    return state.elementContainer.replaceChild(div({className}), root);
  }

  const dom = getControls(state, dispatch);

  state.elementContainer.replaceChild(dom, root);

  return dom;
}

export default controlBar;
