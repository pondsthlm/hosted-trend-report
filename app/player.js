import Hls from "hls.js/dist/hls.light.min.js";
import logger from "./logger.js";
import Ooyala from "./ads/ooyala.js";

class Player {
  constructor(videoElement, adElement) {
    this.video = videoElement;
    this.hls = new Hls();
    this.ooyala = new Ooyala(this, "http://pulse-demo.videoplaza.tv", adElement);
    this.state = "init";
    this.init();
  }

  adBreakStart() {
    this.processEvent({type: "ad-break-start"});
  }

  adBreakEnd() {
    this.processEvent({type: "ad-break-end"});
  }

  init() {
    this.video.addEventListener("timeupdate", () => {
      this.ooyala.timeUpdate(this.video.currentTime);
    });
    this.video.addEventListener("play", this.processEvent.bind(this));
    this.video.addEventListener("pause", this.processEvent.bind(this));
    this.video.addEventListener("ended", this.processEvent.bind(this));
  }

  processEvent(evt) {
    logger.log("Event", evt);
    const nextState = this.evaluateState(this.state, evt);
    if (nextState !== this.state) {
      this.enterState(nextState).catch((err) => {
        logger.error(`Service manager state transition error (${this.state} -> ${nextState}) for ${this.strId}:`, err);
        return this.enterState("fail");
      });
    }
  }

  evaluateState(state, {type}) {
    switch (state) {
      case "init":
        if (type === "load-content") {
          return "content-set";
        }
        break;
      case "content-set":
        if (type === "play") {
          return "starting";
        }
        break;
      case "starting":
        if (type === "ad-break-start") {
          return "ad-break";
        }
        // TODO if timeout go to content-play?
        break;
      case "ad-break":
        if (type === "ad-break-end") {
          return "content-play";
        }
        break;
      case "content-play":
        if (type === "pause") {
          return "content-paused";
        } else if (type === "ad-break-start") {
          return "ad-break";
        }
        break;
      case "content-paused":
        if (type === "play") {
          return "content-play";
        } else if (type === "ended") {
          return "content-ended";
        }
        break;
      case "content-ended":
        break;
      case "fail":
        break;
      default:
        logger.error(`Unknown state for ${state}`);
        break;
    }

    //Otherwise stay in the same state
    return state;
  }

  enterState(state) {
    this.nextState = state;
    logger.info(`State transition ${this.state}->${state}`);
    this.enterStateTime = Date.now();

    let onEnter = Promise.resolve();
    switch (state) {
      case "content-set":
        onEnter = this.load();
        break;
      case "starting":
        onEnter = Promise.resolve(this.ooyala.init()); //TODO should be promise?
        break;
      case "ad-break":
        this.video.pause();
        break;
      case "content-play":
        onEnter = this.video.play().then(() => this.ooyala.contentStarted());
        break;
      case "content-paused":
        if (!this.video.ended) { //If the video is ended then no need for pause ads
          this.ooyala.contentPaused();
        }
        break;
      case "content-ended":
        this.ooyala.contentFinished();
        break;
      case "fail":
        logger.info("Ended in fail state");
        break;
      default:
        logger.error(`Unknown state ${state}`);
        break;
    }

    //If onEnter is successful then change and emit
    return onEnter.then(() => this.setState(state));
  }

  setState(newState) {
    // const oldState = this.state;
    this.state = newState;
    this.nextState = null;
    logger.info(`In state ${newState}`);
    // this.emit("state-change", newState, oldState)
  }

  load() {
    return new Promise((resolve) => {
      const url = this.video.dataset.url;
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
