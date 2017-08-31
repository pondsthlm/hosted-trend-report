import player from "../player";

export const clickPlay = () => ({
  type: player.constants.PLAY,
  payload: {
    trigger: "click",
  }
});

export const clickPause = () => ({
  type: player.constants.PAUSE,
  payload: {
    trigger: "click",
  }
});
