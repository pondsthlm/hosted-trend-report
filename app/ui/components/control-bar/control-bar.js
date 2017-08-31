
import { div } from "../../../helpers/make-element";
import play from "./play";
import "./control-bar.styl";
import volume from "./volume";
import progressBar from "./progress-bar";
import fullscreenButton from "./fullscreen";

const className = "control-bar";
function controlBar(state, dispatch) {

  if (!state.elementContainer ) {
    logger.warning(`Video ${id} is missing elementContainer`);
    return;
  }
  const elementContainer = state.elementContainer;
  let root = elementContainer.querySelector(`.${className}`);
  if (!root) {
    root = elementContainer.appendChild(div(
      {
        className,
      }, "")
    );
  }
  elementContainer.replaceChild(dom(), root);

  function dom(id) {
    return div(
      {
        className,
      },
      play(state, dispatch, id, className),
      volume(state, dispatch, id, className),
      progressBar(state, dispatch, id, className),
      fullscreenButton(state, dispatch, id, className)
    );
  }
}

export default controlBar;
