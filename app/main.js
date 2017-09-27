import player from "./player";
import { createStore } from "redux";
import enhancers from "./enhancers/index.js";
import reducers from "./reducers";



window.Ponyo = window.Ponyo || {};

window.Ponyo.newVideo = (elementContainer, webtvArticle, optionInput = {}) => {
  const options = {
    abTestClass: optionInput.hasOwnProperty("abTestClass") ? optionInput.abTestClass : undefined,
    autoPlay: optionInput.hasOwnProperty("autoplay") &&  optionInput.autoplay === "true" ? true : undefined,
    channel: optionInput.hasOwnProperty("channel") ? optionInput.channel : undefined,
    deviceType: optionInput.hasOwnProperty("deviceType") ? optionInput.deviceType : undefined,
    external: optionInput.hasOwnProperty("external") ? optionInput.external : undefined,
    partnerId: optionInput.hasOwnProperty("partnerId") ? optionInput.partnerId : undefined,
    startNextVideo: optionInput.hasOwnProperty("startNextVideo") ? optionInput.startNextVideo : undefined,
    currentTime: optionInput.hasOwnProperty("starttime") ? optionInput.starttime : undefined,
    volume: optionInput.hasOwnProperty("startvolume") ? optionInput.startvolume : undefined,
    topBar: optionInput.hasOwnProperty("topbar") ? optionInput.topbar : undefined,
  };
  const store = createStore(reducers(), {}, enhancers());

  store.dispatch(player.actions.setupPlayer(elementContainer, webtvArticle, options));
};
