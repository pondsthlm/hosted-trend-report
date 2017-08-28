import player from "../player";

export const clickPlay = (id) => ({
  type: player.constants.PLAY,
  payload: {
    trigger: "click",
    id
  }
});

export const clickPause = (id) => ({
  type: player.constants.PAUSE,
  payload: {
    trigger: "click",
    id
  }
});
