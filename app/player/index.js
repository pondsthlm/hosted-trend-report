import reducer from "./reducer";

const constants = {
  NAME: "player",
  SETUP_NEW_PLAYER: "SETUP_NEW_PLAYER",
  PLAY: "PLAY"
};

const actions = {
  setupPlayer: (elementContainer) => ({
    type: constants.SETUP_NEW_PLAYER,
    payload: {
      elementContainer
    }
  }),
  play: () => ({
    type: constants.PLAY
  })
};

export default { actions, constants, reducer};
