import { button } from "../../../helpers/make-element";
import actions from "../../../player/actions";

let bemParent = "";

function playButton(state, dispatch) {
  return button({
    className: `${bemParent}play-button`,
    onclick: () => {
      dispatch(actions.uiPlay("click", "play-button"));
    }
  }, "▶");
}

function pauseButton(state, dispatch) {
  return button({
    className: `${bemParent}pause-button`,
    onclick: () => {
      dispatch(actions.uiPause("click", "pause-button"));
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
