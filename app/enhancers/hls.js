import Hls from "hls.js/dist/hls.light.min.js";
import logger from "../logger.js";
import player from "../player";
import ui from "../ui";
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
  logger.log("payload", payload);
  const videoElement = video({
    className: "exp-video",
    dataset: {
      id
    }
  }, p("Your user agent does not support the HTML5 Video element."));
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

  return { id, videoElement };
}
const hlsService = (() => {
  const videos = {};

  return (store) => (next) => (action) => {
    switch (action.type) {
      case player.constants.SETUP_NEW_PLAYER: {
        const { id, videoElement } = setUpHlsService(action.payload, store);
        videos[id] = videoElement;
        const newAction = Object.assign({}, action, {
          payload: {
            ...action.payload,
            id,
            video: videoElement
          }
        })

        next(newAction);
        break;
      }

      case player.constants.PAUSE: {
        videos[action.payload.id].pause();

        next(action);
        break;
      }

      /*
      Do nothing if the action does not interest us
      */
      default:

        next(action);
        break;
    }
  };
})();

export default hlsService;
