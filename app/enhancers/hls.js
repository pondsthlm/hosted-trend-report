import Hls from "hls.js/dist/hls.light.min.js";
import logger from "../logger.js";
import player from "../player";
import videoEvents from "./video-events";
import {video, p} from "../helpers/make-element";

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
  const id = Math.random().toString(36).substr(2, 9);
  //const state = store.getState();
  const videoElement = video({
    className: "exp-video",
    dataset: {
      id
    }
  }, p("Your user agent does not support the HTML5 Video element."));
  payload.elementContainer.style.paddingTop = "56.25%";
  payload.elementContainer.style.height = "0";
  payload.elementContainer.style.position = "relative";

  payload.elementContainer.appendChild(videoElement);
  const hls = new Hls();
  hls.loadSource(payload.webtvArticle.streams.hashHls);
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
        id
      }
    });
    store.dispatch(action);
  };

  const localStore = {
    ...store,
    dispatch: localDispatch
  };

  // Setup videoEvents
  videoEvents(localStore, videoElement);

  return { id, videoElement };
}
const hlsService = (() => {
  const videos = {};

  return (store) => (next) => (action) => {
    switch (action.type) {

      case player.constants.SETUP_NEW_PLAYER: {
        const { id, videoElement } = setUpHlsService(action.payload, store);
        videos[id] = videoElement;
        // Decorate with id, element, & duration
        const newAction = Object.assign({}, action, {
          payload: {
            ...action.payload,
            id,
            videoElement,
            duration: videoElement.duration
          }
        });

        return next(newAction);
      }

      default:
        return next(action);
    }
  };
})();

export default hlsService;
