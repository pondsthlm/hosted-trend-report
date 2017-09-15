import player from "./";
import uiComponent from "../ui";

//import logger from "../logger.js";

const defaultState = {
  id: null,
  mode: "init",
  contentReady: false,
  videoElement: null,
  elementContainer: null,
  duration: 0,
  fullscreen: false
};

const reducer = (state = defaultState, action) => {

  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:
      state = Object.assign({}, state, {
        id: action.payload.id,
        videoElement: action.payload.videoElement,
        source: action.payload.webtvArticle,
        elementContainer: action.payload.elementContainer,
        duration: action.payload.duration
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
    case player.constants.PAUSE:
      state.videoElement.pause();
      break;
    case player.constants.SET_TIME:
      state.videoElement.currentTime = action.payload.time;
      break;
    case player.constants.FULLSCREEN:
      if (state.elementContainer.requestFullscreen) state.elementContainer.requestFullscreen();
      else if (state.elementContainer.mozRequestFullScreen) state.elementContainer.mozRequestFullScreen();
      // Safari 5.1 only allows proper fullscreen on the video element. This also works fine on other WebKit browsers as the following CSS (set in styles.css) hides the default controls that appear again, and
      // ensures that our custom controls are visible:
      else if (state.elementContainer.webkitRequestFullScreen) state.videoElement.webkitRequestFullScreen();
      else if (state.elementContainer.msRequestFullscreen) state.elementContainer.msRequestFullscreen();
      state = Object.assign({}, state, {
        fullscreen: true
      });
      break;
    default:
  }

  // Deligate to uiReducer
  const uiState = uiComponent.reducer(state, state.ui, action);
  state = Object.assign({}, state, {
    ui: {
      ...uiState
    }
  });

  return state;
};

export default reducer;
