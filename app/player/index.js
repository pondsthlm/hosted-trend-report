import reducer from "./reducer";

const constants = {
  NAME: "player",
  SETUP_NEW_PLAYER: "SETUP_NEW_PLAYER",
  PLAY: "PLAY",
  PAUSE: "PAUSE",
  CONTENT_PLAY: "CONTENT_PLAY",
  CONTENT_PAUSE: "CONTENT_PAUSE"
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
  })
};

export default { actions, constants, reducer};
