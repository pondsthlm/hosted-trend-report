import constants from "./constants";

const actions = {
  setupPlayer: (elementContainer, webtvArticle) => ({
    type: constants.SETUP_NEW_PLAYER,
    payload: {
      elementContainer,
      webtvArticle
    }
  }),
  play: (id = null) => ({
    type: constants.PLAY,
    payload: {
      id
    }
  }),
  adPlay: (id = null) => ({
    type: constants.AD_PLAY,
    payload: {
      id
    }
  }),
  contentPlay: (id = null) => ({
    type: constants.CONTENT_PLAY,
    payload: {
      id
    }
  }),
  contentPause: (id = null) => ({
    type: constants.CONTENT_PAUSE,
    payload: {
      id
    }
  }),
  contentEnded: (id = null) => ({
    type: constants.CONTENT_ENDED,
    payload: {
      id
    }
  }),
  contentClicked: (id = null) => ({
    type: constants.CONTENT_CLICKED,
    payload: {
      id
    }
  })
};

export default actions;
