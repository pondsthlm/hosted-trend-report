import * as constants from "./constants";

export const clickPlay = (id) => ({
  type: constants.PLAY,
  payload: {
    trigger: "click",
    id
  }
});

export const clickPause = (id) => ({
  type: constants.PAUSE,
  payload: {
    trigger: "click",
    id
  }
});
