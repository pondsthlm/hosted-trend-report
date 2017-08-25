import player from "./";

//import logger from "../logger.js";

const defaultState = {
  mode: "init",
  contentReady: false
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case player.constants.MANIFEST_PARSED:
      state = Object.assign({}, state, {
        contentReady: true
      });
      break;
    default:
  }

  return state;
};

export default reducer;
