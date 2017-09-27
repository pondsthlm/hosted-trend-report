import player from "../player";

//import logger from "../logger.js";

const defaultVideoState = {
  fullScreen: false,
  showControls: true,
  showVolumeControls: false,
  abTestClass: "",
  topBar: true
};

// Deligated from video-reducer
const uiReducer = (state = defaultVideoState, action) => {

  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:
      state = Object.assign({}, state, {
        abTestClass: action.payload.abTestClass ? action.payload.abTestClass : state.abTestClass,
        topBar: action.payload.topBar ? action.payload.topBar : state.topBar,
        id: action.payload.id,
        elementContainer: action.payload.elementContainer
      });
      break;

    case player.constants.AD_BREAK_STARTED:
    case player.constants.AD_SHOW_PAUSE_AD: {
      state = Object.assign({}, state, {
        showControls: false
      });
      break;
    }

    case player.constants.CONTENT_CLICKED:
      state = Object.assign({}, state, {
        showControls: true
      });
      break;

    case player.constants.FULLSCREEN_CHANGE:
      state = Object.assign({}, state, {
        fullScreen: !state.fullScreen
      });
      break;

    case player.constants.VOLUME_BUTTON:
      if (state.showVolumeControls) {
        state = Object.assign({}, state, {
          showVolumeControls: false
        });
      } else {
        state = Object.assign({}, state, {
          showVolumeControls: true
        });
      }
      break;
    default:
  }

  return state;
};

export {defaultVideoState};
export default uiReducer;
