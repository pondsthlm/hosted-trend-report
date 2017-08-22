/*global OO*/ //TODO fix this
import logger from "../logger.js";

/*
startContentPlayback is typically called when the ad player is done playing ads.
In this case, hide your video player when the ads start and show it when the content starts.

illegalOperationOccurred is called when some conflicting events are reported to the ad player by the integration code.
A simple illegal operation would be continuing to report time updates for the content after pauseContentPlayback has been called.

sessionEnded is called by the ad player when it has no more ads to show.

openClickThrough is called when an ad (typically a VPAID ad) requested a clickthrough link to be opened.
It is then up to the integration to open the URL or not. If the link is opened, the SDK must be notified through adClickThroughOpened.
*/
class SessionListener {
  constructor(videoElement) {
    this.videoElement = videoElement;
  }

  startContentPlayback() {
    logger.log("Starting the content playback");
    this.videoElement.play();
  }
  pauseContentPlayback() {
    logger.log("Pausing the content playback and hide our player");
    this.videoElement.pause();
  }
  startAdPlayback(ad, timeout, adPosition) {
    logger.log("Starting the ad playback", ad, timeout, adPosition);
    // // const clickThroughLink = ad.getClickthroughURL();
    // const mediaFiles = ad.getMediaFiles();
  }
  startAdBreak() {
    logger.log("Starting the ad break", arguments);
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
      logger.log("Ad clicked event");
      window.open(metadata.url);
      //Tell the SDK we opened the clickthrough URL.
      this.adPlayer.adClickThroughOpened();
    });

    this.adPlayer.addEventListener(OO.Pulse.AdPlayer.Events.PAUSE_AD_SHOWN, () => {
      logger.log("pause ad shown");
      // Make sure that the videojs control are visible for pause ads
      this.videoElement.style["z-index"] = 10000;
    });

    this.adPlayer.addEventListener(OO.Pulse.AdPlayer.Events.AD_BREAK_STARTED, () => {
      logger.log("Ad break started");
    });

    this.init();
  }

  isSessionValid() {
    return this.sessionStarted;
  }

  init() {
    this.firstPlay = true;
    const contentMetadata = {
      tags: ["standard-linears", "pause"]
    };
    const requestSettings = {
      linearPlaybackPositions: [10, 20],
      nonlinearPlaybackPositions: [50] // For overlay ads
    };
    this.session = OO.Pulse.createSession(contentMetadata, requestSettings);

    this.videoElement.addEventListener("timeupdate", (evt) => {
      logger.log("Timeupdate event", evt, this.videoElement.currentTime);
      if (this.isSessionValid()) {
        this.adPlayer.contentPositionChanged(this.videoElement.currentTime);
      }
    });

    this.videoElement.addEventListener("play", () => {
      logger.log("Video playing", "Initial:", this.firstPlay);

      if (this.firstPlay) {
        const listener = new SessionListener(this.videoElement);
        this.adPlayer.startSession(this.session, listener);
        this.sessionStarted = true;
      } else {
        this.adPlayer.contentStarted();
      }
    });

    this.videoElement.addEventListener("pause", () => {
      this.firstPlay = false;
      this.adPlayer.contentPaused();
    });

    this.videoElement.addEventListener("ended", () => {
      this.adPlayer.contentFinished();
    });
  }
}

export default Ooyala;
