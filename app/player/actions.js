import constants from "./constants";

const actions = {
  contentClicked: () => ({
    type: constants.CONTENT_CLICKED
  }),
  contentEnded: () => ({
    type: constants.CONTENT_ENDED
  }),
  contentPause: () => ({
    type: constants.CONTENT_PAUSE
  }),
  contentPlay: () => ({
    type: constants.CONTENT_PLAY
  }),
  durationChange: (duration) => ({
    type: constants.DURATION_CHANGE,
    payload: {
      duration
    }
  }),
  hideControls: (event) => ({
    type: constants.HIDE_CONTROLS,
    payload: {
      event
    }
  }),
  play: () => ({
    type: constants.PLAY
  }),
  setupPlayer: (elementContainer, webtvArticle, options) => ({
    type: constants.SETUP_NEW_PLAYER,
    payload: {
      elementContainer,
      webtvArticle,
      options
    }
  }),
  setTime: (time) => ({type: constants.SET_TIME,
    payload: {
      time
    }
  }),
  sizeChange: (width) => ({
    type: constants.SIZE_CHANGE,
    payload: {
      width
    }
  }),
  timeupdate: (currentTime) => ({
    type: constants.TIMEUPDATE,
    payload: {
      currentTime
    }
  }),
  fullscreenChange: () => ({
    type: constants.FULLSCREEN_CHANGE,
    payload: {}
  }),
  uiFullscreen: (event, trigger) => ({
    type: constants.FULLSCREEN,
    payload: {
      event,
      trigger
    }
  }),
  uiPause: (event, trigger) => ({
    type: constants.PAUSE,
    payload: {
      event,
      trigger
    }
  }),
  uiPlay: (event, trigger) => ({
    type: constants.PLAY,
    payload: {
      event,
      trigger
    }
  }),
  uiVolumeButton: (event, trigger) => ({
    type: constants.VOLUME_BUTTON,
    payload: {
      event,
      trigger
    }
  }),
  uiVolumeControler: (volume) => ({
    type: constants.SET_VOLUME,
    payload: {
      volume
    }
  }),
  uiMute: (event, trigger) => ({
    type: constants.MUTE,
    payload: {
      event,
      trigger
    }
  }),
  uiUnMute: (event, trigger) => ({
    type: constants.UNMUTE,
    payload: {
      event,
      trigger
    }
  })
};

export default actions;
