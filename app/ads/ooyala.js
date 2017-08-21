/*global OO*/ //TODO fix this
import logger from "../logger.js";

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

    this.adPlayer.addEventListener(OO.Pulse.AdPlayer.Events.AD_CLICKED, (event, metadata) => {
      window.open(metadata.url);
      //Tell the SDK we opened the clickthrough URL.
      this.adPlayer.adClickThroughOpened();
    });

    this.adPlayer.addEventListener(OO.Pulse.AdPlayer.Events.PAUSE_AD_SHOWN, () => {
      // Make sure that the videojs control are visible for pause ads
      this.videoElement.style["z-index"] = 10000;
    });

    this.init();
  }

  init() {
    this.firstPlay = true;
    this.videoElement.addEventListener("play", () => {
      logger.log("Video playing", "Initial:", this.firstPlay);

      if (this.firstPlay) {
        this.firstPlay = false;
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
      } else {
        this.adPlayer.contentStarted();
      }
    });

    this.videoElement.addEventListener("pause", () => {
      this.adPlayer.contentPaused();
    });
  }
}

export default Ooyala;
