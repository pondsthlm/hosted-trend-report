import constants from "./constants";

const actions = {
  setupPlayer: (elementContainer, webtvArticle) => ({
    type: constants.SETUP_NEW_PLAYER,
    payload: {
      elementContainer,
      webtvArticle
    }
  }),
  play: () => ({
    type: constants.PLAY
  }),
  adPlay: () => ({
    type: constants.AD_PLAY
  }),
  contentPlay: () => ({
    type: constants.CONTENT_PLAY
  }),
  contentPause: () => ({
    type: constants.CONTENT_PAUSE
  }),
  contentEnded: () => ({
    type: constants.CONTENT_ENDED
  }),
  contentClicked: () => ({
    type: constants.CONTENT_CLICKED
  }),
  timeupdate: (currentTime) => ({
    type: constants.TIMEUPDATE,
    payload: {
      currentTime
    }
  }),
  durationChange: (duration) => ({
    type: constants.DURATION_CHANGE,
    payload: {
      duration
    }
  }),
  uiPlay: (event, trigger) => ({
    type: constants.PLAY,
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
  })
};

export default actions;
