import Hls from "hls.js/dist/hls.light.min.js";
import logger from "../logger.js";
import player from "../player";
import videoEvents from "./video-events";

const constants = {
  MANIFEST_PARSED: "MANIFEST_PARSED"
};

const actions = {
  manifestParsed: (id) => {
    return {
      type: constants.MANIFEST_PARSED,
      payload: { id }
    };
  }
};

function setUpHlsService(payload, store) {
  const state = store.getState();
  const videoState = state.player.videos[payload.id];

  const videoElement = payload.elementContainer.querySelector(".exp-video");

  payload.elementContainer.style.paddingTop = "56.25%";
  payload.elementContainer.style.height = "0";
  payload.elementContainer.style.position = "relative";

  const hls = new Hls({ autoStartLoad: false });
  hls.loadSource(videoState.source.streams.hashHls);
  hls.attachMedia(videoElement);


  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    store.dispatch(actions.manifestParsed());
  });

  hls.on(Hls.Events.ERROR, (event, data) => {
    if (data.fatal) {
      logger.warning(`HLS error: ${data.type}`);
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          // try to recover network error
          logger.log("fatal network error encountered, try to recover");
          hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          logger.log("fatal media error encountered, try to recover");
          hls.recoverMediaError();
          break;
        default:
          // cannot recover
          hls.destroy();
          break;
      }
    }
  });

  // Remove id complexity
  const localDispatch = (action) => {
    // Decorate with id
    action = Object.assign({}, action, {
      ...action,
      payload: {
        ...action.payload,
        id: payload.id
      }
    });
    store.dispatch(action);
  };

  const localStore = {
    ...store,
    dispatch: localDispatch
  };

  // Setup videoEvents
  videoEvents(localStore, videoElement, payload.elementContainer);

  return {videoElement, hls };
}
const hlsService = (() => {
  const hlsElements = {};

  return (store) => (next) => (action) => {
    switch (action.type) {

      case player.constants.DOM_READY: {
        const {videoElement, hls } = setUpHlsService(action.payload, store);
        hlsElements[action.payload.id] = hls;
        // Decorate with id, element, & duration
        const newAction = Object.assign({}, action, {
          payload: {
            ...action.payload,
            videoElement,
            duration: videoElement.duration
          }
        });

        return next(newAction);
      }

      case player.constants.PLAY:
      case player.constants.CONTENT_PLAY:
        hlsElements[action.payload.id].startLoad();

        return next(action);

      default:
        return next(action);
    }
  };
})();

export default hlsService;
