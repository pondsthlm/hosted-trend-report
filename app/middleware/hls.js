import Hls from "hls.js/dist/hls.light.min.js";
import logger from "../logger.js";
import player from "../player";

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
  const video = payload.elementContainer.querySelector("video");
  const hls = new Hls();
  hls.loadSource("http://0ef62d28f8e26bbdbb21f31a1727cec6-httpcache0-03837-cacheod0.dna.qbrick.com/03837-cacheod0/_definst_/smil:ncode/2017-06-14/000066908_000_497435541/2101706140006809221-logo_576p/chunklist_b700000.m3u8");
  hls.attachMedia(video);


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

  return id;
}

const hlsService = (store) => (next) => (action) => {
  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:

      const id = setUpHlsService(action.payload, store);
      const newAction = Object.assign({}, action, {
        payload: {
          ...action.payload,
          id
        }
      })

      next(newAction);
      break;

    case "OOYALA_READY":

      next(action);
      break;
    /*
    Do nothing if the action does not interest us
    */
    default:
      next(action);
      break;
  }
};

export default hlsService;
