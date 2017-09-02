import player from "./player";
import logger from "./logger.js";
import { createStore } from "redux";
import enhancers from "./enhancers/index.js";
import reducers from "./reducers";


const store = createStore(reducers(), {}, enhancers());

window.Ponyo = window.Ponyo || {};

window.Ponyo.newVideo = (elementContainer, webtvArticle) => {
  store.dispatch(player.actions.setupPlayer(elementContainer, webtvArticle));
};
