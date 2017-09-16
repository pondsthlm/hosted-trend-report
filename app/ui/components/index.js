import controlBar from "./control-bar/control-bar";
import logger from "../../logger";


function render(state, dispatch) {
  if (!state.elementContainer ) {
    logger.error("Video is missing elementContainer");
    return;
  }
  const dom = controlBar(state, dispatch);
  state.elementContainer.appendChild(dom);

  return dom;
}

export default { render };
