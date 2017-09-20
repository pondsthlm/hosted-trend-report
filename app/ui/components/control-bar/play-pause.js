import { button, div } from "../../../helpers/make-element";
import actions from "../../../player/actions";


function updatePlayParams(state, dispatch, className) {
  let flag = "";
  if (state.isPlaying) {
    flag = "--hide";
  }
  return {
    className: `${className}play-button${flag}`,
    onclick: () => {
      dispatch(actions.uiPlay("click", "play-button"));
    }
  };
}

function updatePauseParams(state, dispatch, className) {
  let flag = "";
  if (!state.isPlaying) {
    flag = "--hide";
  }
  return {
    className: `${className}pause-button${flag}`,
    onclick: () => {
      dispatch(actions.uiPause("click", "pause-button"));
    }
  };
}

function playButton(state, dispatch, className) {
  return button(updatePlayParams(state, dispatch, className), "▶");
}

function pauseButton(state, dispatch, className) {
  return button(updatePauseParams(state, dispatch, className), "||");
}

function playPause(state, dispatch, parentClassName) {
  let bemParent = "";
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }

  const play = playButton(state, dispatch, bemParent);
  const pause = pauseButton(state, dispatch, bemParent);

  play.update((newState) => updatePlayParams(newState, dispatch, bemParent));
  pause.update((newState) => updatePauseParams(newState, dispatch, bemParent));

  return div(play, pause);
}

export default playPause;
