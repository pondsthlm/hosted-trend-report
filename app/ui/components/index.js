import gui from "./gui/gui";
import logger from "../../logger";


function render(state, dispatch) {
  if (!state.elementContainer ) {
    logger.error("Video is missing elementContainer");
    return;
  }
  const dom = gui(state, dispatch);
  dom.setVideoId(state.id);
  state.elementContainer.appendChild(dom);

  return dom;
}

export default { render };
