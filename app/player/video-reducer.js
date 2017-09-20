import player from "./";
import uiComponent from "../ui";
import logger from "../logger.js";

//import logger from "../logger.js";

const defaultState = {
  id: null,
  mode: "init",
  contentReady: false,
  videoElement: null,
  elementContainer: null,
  duration: 0,
  adDuration: 0,
  adDurationLeft: 0,
  display: "preview",
  isMuted: true,
  fullscreen: false,
  defaultVolume: .8,
  volume: .8,
  isPlaying: false,
  currentTime: -1,
  adCurrentTime: 0
};

const reducer = (state = defaultState, action) => {
  const isOwn = action.payload.id === state.id;
  const passThrough = action.type === player.constants.SETUP_NEW_PLAYER;
  if (passThrough || isOwn) {
    logger.log("player deligate to video", action);
  } else {
    return state;
  }

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

    case player.constants.TIMEUPDATE:
      state = Object.assign({}, state, {
        currentTime: action.payload.currentTime
      });
      break;

    case player.constants.AD_TIMEUPDATE:
      state = Object.assign({}, state, {
        adCurrentTime: action.payload.currentTime,
        adDurationLeft: state.adDuration - action.payload.currentTime
      });
      break;

    case player.constants.AD_FINISHED:
      state = Object.assign({}, state, {
        adDuration: state.adDuration - state.adDurationLeft
      });
      break;

    case player.constants.MANIFEST_PARSED:
      state = Object.assign({}, state, {
        contentReady: true
      });
      break;

    case player.constants.CONTENT_PLAY:
    case player.constants.PLAY:
      state = Object.assign({}, state, {
        isPlaying: true,
        display: "content"
      });
      state.videoElement.play();
      break;

    case player.constants.AD_BREAK_STARTED:
      state = Object.assign({}, state, {
        isPlaying: false,
        display: action.payload.type,
        adDuration: action.payload.duration,
        adDurationLeft: action.payload.duration
      });
      break;

    case player.constants.AD_SHOW_PAUSE_AD:
      state = Object.assign({}, state, {
        isPlaying: false,
        display: "pause-ad"
      });
      break;

    case player.constants.CONTENT_PAUSE:
    case player.constants.PAUSE:
      state = Object.assign({}, state, {
        isPlaying: false
      });
      state.videoElement.pause();
      break;

    case player.constants.SET_TIME:
      state.videoElement.currentTime = action.payload.time;
      break;

    case player.constants.DURATION_CHANGE:
      state = Object.assign({}, state, {
        duration: action.payload.duration
      });
      break;

    case player.constants.SET_VOLUME:
      if (action.payload.volume !== 0) {
        state = Object.assign({}, state, {
          volume: action.payload.volume,
          isMuted: false
        });
      } else {
        state = Object.assign({}, state, {
          defaultVolume: state.volume,
          isMuted: true
        });
      }
      state.videoElement.volume = action.payload.volume;
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

    case player.constants.MUTE:
      state = Object.assign({}, state, {
        isMuted: true,
        defaultVolume: state.volume,
        volume: 0
      });
      state.videoElement.volume = 0;
      break;

    case player.constants.UNMUTE:
      state = Object.assign({}, state, {
        isMuted: false,
        volume: state.defaultVolume
      });
      state.videoElement.volume = state.defaultVolume;
      break;

    default:
  }
  // Deligate to uiReducer
  if (action.payload.id === state.id) {
    const uiState = uiComponent.reducer(state.ui, action);
    state = Object.assign({}, state, {
      ui: {
        ...uiState
      }
    });
  }

  return state;
};

export default reducer;
