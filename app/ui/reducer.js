import player from "../player";

//import logger from "../logger.js";

const defaultVideoState = {
  showControls: true,
  showVolumeControls: false,
};

// Deligated from video-reducer
const uiReducer = (fullState, state = defaultVideoState, action) => {

  switch (action.type) {

    case player.constants.AD_PLAY: {
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
