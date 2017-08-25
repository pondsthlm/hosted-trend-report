import player from "./player";
import logger from "./logger.js";
import { createStore } from "redux";
import middlewares from "./middleware/index.js";
import reducers from "./reducers";


const store = createStore(reducers(), {}, middlewares());

function run() {

  const elementContainers = document.querySelectorAll(".exp-video-player");

  [].forEach.call(elementContainers, (elementContainer) => {
    logger.log("Found video", elementContainer);
    store.dispatch(player.actions.setupPlayer(elementContainer));
  });

}

run();
