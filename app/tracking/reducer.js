import player from "../player";

//import logger from "../logger.js";

const defaultVideoState = {
};

const trackingReducer = (fullState, state = defaultVideoState, action) => {

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

  return state;
};

export {defaultVideoState};
export default trackingReducer;
