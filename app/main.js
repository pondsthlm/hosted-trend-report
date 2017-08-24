import Player from "./player.js";
import logger from "./logger.js";
import { createStore } from "redux";
import middlewares from "./middleware/index.js";
import reducers from "./reducers";

import counter from "./containers/counter";
import { div } from "./helpers/make-element";


const store = createStore(reducers(), {}, middlewares());

store.subscribe(() => {
  render();
});
document.addEventListener("DOMContentLoaded", () => {
  render();
});

function render() {
  const app = div({ id: "app" }, counter.components.sum(store), counter.components.addButton(store));
  if (document.body.isEqualNode(app)) {
    return;
  }
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  document.body.appendChild(
    div({ id: "app" }, counter.components.counter(store))
  );
}

function run() {
  if (!Player.isHlsSupported()) {
    logger.log("Go read a book!");
    return;
  }

  const playerWrappers = document.querySelectorAll(".exp-video-player");

  [].forEach.call(playerWrappers, (playerWrapper) => {
    const videoElement = playerWrapper.querySelector(".video");
    videoElement.dataset.url = "http://0ef62d28f8e26bbdbb21f31a1727cec6-httpcache0-03837-cacheod0.dna.qbrick.com/03837-cacheod0/_definst_/smil:ncode/2017-06-14/000066908_000_497435541/2101706140006809221-logo_576p/chunklist_b700000.m3u8";
    const adElement = playerWrapper.querySelector(".ad-video");
    const player = new Player(videoElement, adElement);
    // const url = "http://httpcache0.03837-cachelive2.dna.qbrick.com/03837-cachelive2/smil:03837_tx2_720p/playlist.m3u8";
    player.processEvent({type: "load-content"});
  });

}

run();
