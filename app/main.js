import player from "./player";
import ui from "./ui";
import logger from "./logger.js";
import { createStore } from "redux";
import middlewares from "./middleware/index.js";
import reducers from "./reducers";


const store = createStore(reducers(), {}, middlewares());

store.subscribe(() => {
  logger.log("STORE_UPPDATED");
  ui.components.update(store);
});
function run() {

  const elementContainers = document.querySelectorAll(".exp-video-player");

  [].forEach.call(elementContainers, (elementContainer) => {
    logger.log("Found video", elementContainer);
    store.dispatch(player.actions.setupPlayer(elementContainer));
  });


}

run();
