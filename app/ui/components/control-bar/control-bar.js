
import { div } from "../../../helpers/make-element";
import logger from "../../../logger";
import play from "./play";
import "./control-bar.styl";
import volume from "./volume";
import progressBar from "./progress-bar";
import fullscreenButton from "./fullscreen";

const className = "control-bar";
function controlBar(state, dispatch) {

  if (!state.elementContainer ) {
    logger.error(`Video is missing elementContainer`);
    return;
  }

  let root = state.elementContainer.querySelector(`.${className}`);
  if (!root) {
    root = state.elementContainer.appendChild(div({className}, ""));
  }

  const dom = div(
    {
      className,
    },
    play(state, dispatch, className),
    volume(state, dispatch, className),
    progressBar(state, dispatch, className),
    fullscreenButton(state, dispatch, className)
  );

  state.elementContainer.replaceChild(dom, root);

  return dom;
}

export default controlBar;
