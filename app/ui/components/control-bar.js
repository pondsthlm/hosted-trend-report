
import { div } from "../../helpers/make-element";
import play from "./play";
import "./control-bar.styl";
import volume from "./volume";
import progressBar from "./progress-bar";
import fullscreenButton from "./fullscreen";

const className = "control-bar";
function controlBar(store, id) {
  const state = store.getState();

  if (!state.ui.videos[id].elementContainer ) {
    logger.warning(`Video ${id} is missing elementContainer`);
    return;
  }
  const elementContainer = state.ui.videos[id].elementContainer;
  let root = elementContainer.querySelector(`.${className}`);
  if (!root) {
    root = elementContainer.appendChild(div(
      {
        className,
      }, "")
    );
  }
  elementContainer.replaceChild(dom(id), root);

  function dom(id) {
    return div(
      {
        className,
      },
      play(store, id, className),
      volume(store, id, className),
      progressBar(store, id, className),
      fullscreenButton(store, id, className)
    );
  }
}

export default controlBar;
