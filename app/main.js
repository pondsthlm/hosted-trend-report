import Player from "./player.js";
import Ooyala from "./ads/ooyala.js";
import logger from "./logger.js";

function run() {
  if (!Player.isHlsSupported()) {
    logger.log("Go read a book!");
    return;
  }

  const videoElement = document.getElementById("video");
  const adElement = document.getElementById("ad-video");

  const player = new Player(videoElement);
  const ooyala = new Ooyala("http://pulse-demo.videoplaza.tv", adElement, videoElement);

  // const url = "http://httpcache0.03837-cachelive2.dna.qbrick.com/03837-cachelive2/smil:03837_tx2_720p/playlist.m3u8";
  const url = "http://0ef62d28f8e26bbdbb21f31a1727cec6-httpcache0-03837-cacheod0.dna.qbrick.com/03837-cacheod0/_definst_/smil:ncode/2017-06-14/000066908_000_497435541/2101706140006809221-logo_576p/chunklist_b700000.m3u8";
  player.load(url);
}

run();
