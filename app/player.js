import Hls from "hls.js/dist/hls.light.min.js";
import logger from "./logger.js";

class Player {
  constructor(videoElement) {
    this.video = videoElement;
    this.hls = new Hls();
  }

  load(url) {
    return new Promise((resolve) => {
      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // this.video.play().then(resolve).catch(reject);
        resolve();
      });
      this.hls.on(Hls.Events.ERROR, (event, data) => {
        logger.error(data);
      });
    });
  }

  static isHlsSupported() {
    return Hls.isSupported();
  }

}

export default Player;
