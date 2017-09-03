import reducer from "./reducer";

const constants = {
  NAME: "player",
  AD_PLAY: "AD_PLAY",
  SETUP_NEW_PLAYER: "SETUP_NEW_PLAYER",
  PLAY: "PLAY",
  PAUSE: "PAUSE",
  CONTENT_PLAY: "CONTENT_PLAY",
  CONTENT_PAUSE: "CONTENT_PAUSE",
  CONTENT_ENDED: "CONTENT_ENDED",
  CONTENT_CLICKED: "CONTENT_CLICKED"
};

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

export default { actions, constants, reducer};
