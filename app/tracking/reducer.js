import player from "../player";

import logger from "../logger.js";

const defaultVideoState = {
  updates: 0,
  isPlaying: false,
  elementContainer: null,
  showControls: true,
  hideControls: false,
  id: null,
  duration: 0,
  currentTime: -1,
  fullscreen: false
};

// Indicate to ui enhancer to update
function updateUI(state) {
  return Object.assign({}, state, {
    updates: state.updates + 1
  });
}

// Deligated from video-reducer
const uiReducer = (fullState, state = defaultVideoState, action) => {

  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:
      state = Object.assign({}, state, {
        elementContainer: action.payload.elementContainer,
        id: action.payload.id,
        duration: action.payload.duration
      });
      break;

    case player.constants.AD_PLAY: {
      state = Object.assign({}, state, {
        showControls: false
      });
      break;
    }

    case player.constants.CONTENT_PLAY:
      state = Object.assign({}, state, {
        isPlaying: true
      });
      break;

    case player.constants.CONTENT_CLICKED:
      state = Object.assign({}, state, {
        showControls: true
      });
      break;

    case player.constants.CONTENT_PAUSE:
    case player.constants.PAUSE:
      state = Object.assign({}, state, {
        isPlaying: false
      });
      break;
    case player.constants.TIMEUPDATE:
      state = Object.assign({}, state, {
        currentTime: action.payload.currentTime
      });
      break;
    case player.constants.DURATION_CHANGE:
      state = Object.assign({}, state, {
        duration: action.payload.duration
      });
      break;
    default:
  }

  state = updateUI(state);

  return state;
};

export {defaultVideoState};
export default uiReducer;
