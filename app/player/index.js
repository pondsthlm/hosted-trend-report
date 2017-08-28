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
  setupPlayer: (elementContainer) => ({
    type: constants.SETUP_NEW_PLAYER,
    payload: {
      elementContainer
    }
  }),
  play: (id) => ({
    type: constants.PLAY
  }),
  contentPlay: (id) => ({
    type: constants.CONTENT_PLAY,
    payload: {
      id
    }
  }),
  contentPause: (id) => ({
    type: constants.CONTENT_PAUSE,
    payload: {
      id
    }
  })
};

export default { actions, constants, reducer};
