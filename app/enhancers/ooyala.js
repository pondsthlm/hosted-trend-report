import player from "../player";
import ooyalaEvents from "./ooyala-events";
import {div} from "../helpers/make-element";

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
    const adContainer = div({
      className: "ad-video"
    });
    payload.elementContainer.appendChild(adContainer);

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

function getOoyalaEvents(store, id, adPlayer) {
  const localDispatch = (action) => {
    action = Object.assign({}, action, {
      ...action,
      payload: {
        ...action.payload,
        id
      }
    });
    store.dispatch(action);
  };

  const localStore = {
    ...store,
    dispatch: localDispatch
  };
  return ooyalaEvents(localStore, adPlayer);
}

const ooyala = (() => {
  const videos = {};

  return (store) => (next) => (action) => {
    /*
    Pass all actions through by default
    */

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
        } else {
          video.adPlayer.startSession(video.session, getOoyalaEvents(store, action.payload.id, video.adPlayer));
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
      case player.constants.CONTENT_ENDED: {
        const video = videos[action.payload.id];
        video.adPlayer.contentFinished();

        break;
      }

      /*
      Do nothing if the action does not interest us
      */
      default:
        break;
    }

    return next(action);
  };

})();

export default ooyala;
