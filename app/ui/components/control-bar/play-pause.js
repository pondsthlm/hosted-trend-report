import { button, div } from "../../../helpers/make-element";
import actions from "../../../player/actions";

let bemParent = "";

function updatePlayParams(state, dispatch) {
  let flag = "";
  if (state.isPlaying) {
    flag = "--hide";
  }
  return {
    className: `${bemParent}play-button${flag}`,
    onclick: () => {
      dispatch(actions.uiPlay("click", "play-button"));
    }
  };
}

function updatePauseParams(state, dispatch) {
  let flag = "";
  if (!state.isPlaying) {
    flag = "--hide";
  }
  return {
    className: `${bemParent}pause-button${flag}`,
    onclick: () => {
      dispatch(actions.uiPause("click", "pause-button"));
    }
  };
}

function playButton(state, dispatch) {
  return button(updatePlayParams(state, dispatch), "▶");
}

function pauseButton(state, dispatch) {
  return button(updatePauseParams(state, dispatch), "||");
}

function playPause(state, dispatch, parentClassName) {
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }

  const play = playButton(state, dispatch);
  const pause = pauseButton(state, dispatch);

  play.update((newState) => updatePlayParams(newState, dispatch));
  pause.update((newState) => updatePauseParams(newState, dispatch));

  return div(play, pause);
}

export default playPause;
