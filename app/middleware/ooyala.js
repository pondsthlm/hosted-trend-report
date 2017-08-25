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

const ooyala = (function () {
  const adPlayers = {};

  return (store) => (next) => (action) => {
    switch (action.type) {
      case player.constants.SETUP_NEW_PLAYER:
        setUpAdService(action.payload, store);
        break;
      case "OOYALA_READY":
        adPlayers[action.payload.id] = action.payload;
        break;
      case player.constants.PLAY: {
        const adPlayer = adPlayers[action.payload.id];
        adPlayer.adPlayer.startSession(adPlayer.session, ooyalaEvents(store, adPlayer.id));
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
