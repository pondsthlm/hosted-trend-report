import gui from "./gui/gui";
import logger from "../../logger";


function get(state, dispatch) {
  if (!state.elementContainer ) {
    logger.error("Video is missing elementContainer");
    return;
  }
  const dom = gui(state, dispatch);

  return dom;
}

export default { get };
