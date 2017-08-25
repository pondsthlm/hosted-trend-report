
import { div } from "../../helpers/make-element";
import play from "./play";
import "./control-bar.styl";
import volume from "./volume";
import progressBar from "./progress-bar";
import fullscreenButton from "./fullscreen";

const className = "control-bar";
function controlBar(store) {
  const state = store.getState();
  console.log("state", state);
  for (const id in state.ui.videos) {
    if (!state.ui.videos[id].elementContainer ) {
      return;
    }
    const elementContainer = state.ui.videos[id].elementContainer;
    if (!elementContainer.querySelector(`.${className}`)) {
      elementContainer.appendChild(div(
        {
          className,
        }, "")
      );
    }
    const root = elementContainer.querySelector(`.${className}`);
    state.ui.videos[id].elementContainer.replaceChild(dom(id), root);
  }

  function dom(id) {
    console.log("ID", id);
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
