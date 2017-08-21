/*global OO*/ //TODO fix this
import logger from "../logger.js"

class SessionListener {
  constructor(videoElement) {
    this.videoElement = videoElement;
  }

  startContentPlayback() {
    logger.log("Starting the content playback");
    this.videoElement.play();
  }
  startAdPlayback(ad, timeout, adPosition) {
    logger.log("Starting the ad playback", ad, timeout, adPosition);

    // // const clickThroughLink = ad.getClickthroughURL();
    // const mediaFiles = ad.getMediaFiles();

  }
  startAdBreak() {
    logger.log("Starting the ad break", arguments);
  }
  pauseContentPlayback() {
    logger.log("Pausing the content playback and hide our player");
    this.videoElement.pause();
  }
  illegalOperationOccurred(message) {
    logger.warn(`Illegal operation ${message}`);
  }
  sessionEnded() {
    logger.log("Session ended!");
  }
  openClickThrough(url) {
    logger.log("Click Thru", url);
  }
}

//TODO this should be singleton?
class Ooyala {
  constructor(pulseHost, adElement, videoElement) {
    this.pulseHost = pulseHost;
    this.videoElement = videoElement;

    OO.Pulse.setPulseHost(this.pulseHost);
    this.adPlayer = OO.Pulse.createAdPlayer(adElement, null, null);

    this.init();
  }

  init() {
    this.videoElement.addEventListener("play", () => {
      logger.log("Video playing");

      if (!this.session) {
        const contentMetadata = {
          tags: ["standard-linears", "pause"]
        };
        const requestSettings = {
          linearPlaybackPositions: [10, 20],
          nonlinearPlaybackPositions: [50] // For overlay ads
        };
        this.session = OO.Pulse.createSession(contentMetadata, requestSettings);
        const listener = new SessionListener(this.videoElement);
        this.adPlayer.startSession(this.session, listener);
      }
    });
  }
}

export default Ooyala;
