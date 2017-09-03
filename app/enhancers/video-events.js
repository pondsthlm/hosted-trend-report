import logger from "../logger.js";
import player from "../player";

function videoEvents(store, id, videoElement) {
  videoElement.addEventListener("timeupdate", () => {
    logger.log("timeupdate");
  }, true);
  videoElement.addEventListener("ended", () => {
    store.dispatch(player.actions.contentEnded(id));
  }, true);
  videoElement.addEventListener("click", () => {
    store.dispatch(player.actions.contentClicked(id));
  }, true);
}

export default videoEvents;
