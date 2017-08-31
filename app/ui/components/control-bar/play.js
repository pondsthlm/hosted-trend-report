import { button } from "../../../helpers/make-element";
import { clickPlay, clickPause } from "../../actions";

let bemParent = "";

function playButton(state, dispatch) {
  return button({
    className: `${bemParent}play-button`,
    onclick: () => {
      dispatch(clickPlay());
    }
  }, "▶");
}

function pauseButton(state, dispatch) {
  return button({
    className: `${bemParent}pause-button`,
    onclick: () => {
      dispatch(clickPause());
    }
  }, "||");
}

function play(state, dispatch, parentClassName) {
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  if (state.isPlaying) {
    return pauseButton(state, dispatch);
  } else {
    return playButton(state, dispatch);
  }
}

export default play;
