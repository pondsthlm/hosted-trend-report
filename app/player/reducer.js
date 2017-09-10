import videoReducer from "./video-reducer";

import logger from "../logger.js";

const defaultState = {
  mode: "init",
  videos: {}
};

const reducer = (state = defaultState, action) => {
  // Deligate to videoReducer
  if (action.payload && action.payload.id) {
    const newVideoState = videoReducer(state.videos[action.payload.id], action);
    logger.log("player deligate to video", action);
    state = Object.assign({}, state, {
      videos: {
        ...state.videos,
        [action.payload.id]: newVideoState
      }
    });
  }
  switch (action.type) {
    default:
  }

  return state;
};

export default reducer;
