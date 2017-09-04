import player from "./";

//import logger from "../logger.js";

const defaultState = {
  id: null,
  mode: "init",
  contentReady: false,
  videoElement: null,
  elementContainer: null
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:
      state = Object.assign({}, state, {
        id: action.payload.id,
        videoElement: action.payload.videoElement,
        source: action.payload.webtvArticle,
        elementContainer: action.payload.elementContainer
      });
      break;
    case player.constants.MANIFEST_PARSED:
      state = Object.assign({}, state, {
        contentReady: true
      });
      break;
    case player.constants.CONTENT_PLAY: {
      state.videoElement.play();
      break;
    }
    case player.constants.CONTENT_PAUSE:
      state.videoElement.pause();
      break;
    default:
  }

  return state;
};

export default reducer;
