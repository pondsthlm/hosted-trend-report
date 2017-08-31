import player from "../player";

import logger from "../logger.js";

const defaultVideoState = {
  updates: 0,
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
      });

      break;

    case player.constants.CONTENT_PLAY:
      state = Object.assign({}, state, {
        isPlaying: true
      });
      break;

    case player.constants.CONTENT_PAUSE:
    case player.constants.PAUSE:
      state = Object.assign({}, state, {
        isPlaying: false
      });
      break;
    default:
  }
  state = Object.assign({}, state, {
    updates: state.updates + 1
  });

  return state;
};

const uiReducer = (state = defaultUiState, action) => {

  logger.log("action.type", action.type);
  if (action.payload && action.payload.id) {
    const newVideoState = videoReducer(state.videos[action.payload.id], action);
    logger.log("ui deligate action to video:", action.payload.id);
    state = Object.assign({}, state, {
      videos: {
        [action.payload.id]: newVideoState
      }
    });
  }

  switch (action.type) {
    default:
  }

  return state;
};
export {defaultVideoState};
export default uiReducer;
