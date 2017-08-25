import * as constants from "./constants";
import player from "../player";

import logger from "../logger.js";

const defaultVideoState = {
  isPlaying: false,
  elementContainer: null
};
const defaultUiState = {
  videos: {}
};

const videoReducer = (state = defaultVideoState, action) => {
  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:
    state = Object.assign({}, state, {
      elementContainer: action.payload.elementContainer
    })

    break;
    default:
  }

  return state;
};

const uiReducer = (state = defaultUiState, action) => {
  if (action.payload && action.payload.id) {
    const newVideoState = videoReducer(state.videos[action.payload.id], action);
    logger.log("deligate to video", action.payload.id)
    state = Object.assign({}, state, {
      videos: {
        ...state.videos,
        [action.payload.id]: newVideoState
      }
    });
  }

  switch (action.type) {
    default:
  }

  return state;
};

export default uiReducer;
