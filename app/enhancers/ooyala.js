import player from "../player";
import logger from "../logger.js";
import ooyalaEvents from "./ooyala-events";

function setUpAdService(payload, store) {

  if (!window.OO) {
    Object.defineProperty(window, "OO", {
      configurable: true,
      get: () => {
        return undefined;
      },
      set: (value) => {
        delete window.OO;
        window.OO = value;
        initAdService(value);
      }
    });
  } else {
    initAdService(window.OO);
  }

  function initAdService(OO) {
    //const content = payload.elementContainer.querySelector(".video");
    const adContainer = payload.elementContainer.querySelector(".ad-video");

    OO.Pulse.setPulseHost("http://pulse-demo.videoplaza.tv");


    const contentMetadata = {
      tags: ["standard-linears", "pause"]
    };

    const requestSettings = {
      linearPlaybackPositions: [10, 20],
      nonlinearPlaybackPositions: [50] // For overlay ads
    };


    const adPlayer = OO.Pulse.createAdPlayer(adContainer);
    const session = OO.Pulse.createSession(contentMetadata, requestSettings);

    store.dispatch({
      type: "OOYALA_READY",
      payload: {
        adPlayer,
        session,
        id: payload.id
      }
    });
  }
}


/*
content.addEventListener("play", () => {
  if (initialPlay) {
    content.pause();//Pause the content so we can play prerolls
    adPlayer.startSession(session, adPlayerListener);
  } else {
    //When the content is resumed, call contentStarted
    adPlayer.contentStarted();
  }
});
content.addEventListener("pause", () => {
  initialPlay = false;
  //Call contentPaused when the content is paused by the viewer, so pause ads can be shown if available.
  adPlayer.contentPaused();
});
content.addEventListener("timeupdate", () => {
  adPlayer.contentPositionChanged(content.currentTime);
});
content.addEventListener("ended", () => {
  adPlayer.contentFinished();
});

adPlayer.addEventListener(OO.Pulse.AdPlayer.Events.AD_CLICKED, (event, metadata) => {
  window.open(metadata.url);
  //Tell the SDK we opened the clickthrough URL.
  adPlayer.adClickThroughOpened();
});

*/

const ooyala = (() => {
  const videos = {};

  return (store) => (next) => (action) => {
    switch (action.type) {
      case player.constants.SETUP_NEW_PLAYER:
        setUpAdService(action.payload, store);
        break;
      case "OOYALA_READY":
        videos[action.payload.id] = action.payload;
        videos[action.payload.id].hasSession = false;
        break;
      case player.constants.PLAY: {
        const video = videos[action.payload.id];
        if (video.hasSession) {
          video.adPlayer.contentStarted();
          action = Object.assign({}, action, player.actions.contentPlay(action.payload.id));
        } else {
          video.adPlayer.startSession(video.session, ooyalaEvents(store, video.id));
          video.hasSession = true;
        }
        break;
      }
      case player.constants.CONTENT_PLAY: {
        const video = videos[action.payload.id];
        if (video.hasSession) {
          video.adPlayer.contentStarted();
        }
        break;
      }
      case player.constants.PAUSE: {
        const video = videos[action.payload.id];
        video.adPlayer.contentPaused();
        break;
      }

      /*
      Do nothing if the action does not interest us
      */
      default:
        break;
    }

    /*
    Pass all actions through by default
    */
    next(action);
  };

})();

export default ooyala;
