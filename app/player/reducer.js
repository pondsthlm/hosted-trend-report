import player from "./";
import videoReducer from "./video-reducer";

import logger from "../logger.js";

const defaultState = {
  mode: "init",
  videos: {}
};

const reducer = (state = defaultState, action) => {
  if (action.payload && action.payload.id) {
    const newVideoState = videoReducer(state.videos[action.payload.id], action);
    logger.log("deligate to video", action.payload.id)
    state = Object.assign({}, state, {
      videos: {
        ...state.videos,
        [action.payload.id]: newVideoState
      }
    });
  }
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
