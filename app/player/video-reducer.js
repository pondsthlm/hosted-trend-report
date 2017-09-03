import player from "./";

//import logger from "../logger.js";

const defaultState = {
  id: null,
  mode: "init",
  contentReady: false,
  video: null,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:
      state = Object.assign({}, state, {
        id: action.payload.id,
        video: action.payload.video,
        source: action.payload.webtvArticle
      });
      break;
    case player.constants.MANIFEST_PARSED:
      state = Object.assign({}, state, {
        contentReady: true
      });
      break;
    case player.constants.CONTENT_PLAY: {
      state.video.play();
      break;
    }
    case player.constants.CONTENT_PAUSE:
      state.video.pause();
      break;
    default:
  }

  return state;
};

export default reducer;
