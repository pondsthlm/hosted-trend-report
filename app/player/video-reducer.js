import player from "./";

//import logger from "../logger.js";

const defaultState = {
  id: null,
  mode: "init",
  contentReady: false,
  video: null
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:
    state = Object.assign({}, state, {
      id: action.payload.id,
      video: action.payload.video
    });
    break;
    case player.constants.MANIFEST_PARSED:
      state = Object.assign({}, state, {
        contentReady: true
      });
      break;

    case player.constants.PLAY:
      //state.video.play();
      break;
    default:
  }

  return state;
};

export default reducer;
