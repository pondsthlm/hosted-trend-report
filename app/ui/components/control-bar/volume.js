import { button, div } from "../../../helpers/make-element";
import actions from "../../../player/actions";

import "./volume.styl";

function volume(state, dispatch, parentClassName) {
  const className = "volume";
  const bemParent = parentClassName ? `${parentClassName}__` : "";

  return div(
    {className: `${bemParent}${className} ${className}`},
    sound(state, dispatch, className),
    mute(state, dispatch, className),
    volumeControl(state, dispatch, className)
  );
}

function volumeControl(state, dispatch, className) {
  const dom = div({
    className: `${className}__control--hide`,
    onmousedown(event) {
      const offsetY = event.clientY - dom.getBoundingClientRect().top;
      const percent = dom.offsetHeight ? offsetY / dom.offsetHeight : 0;
      dispatch(actions.uiVolumeControler(1 - percent));
    },
    update: (newState) => {
      if (newState.ui.showControls && newState.ui.showVolumeControls) {
        return {
          className: `${className}__control`,
        };
      }
      return {
        className: `${className}__control--hide`
      };

    }
  }, div({
    className: `${className}__indicator`,
    style: {
      height: `${state.volume * 100}%`
    },
    update: (newState) => {
      return {
        style: {
          height: `${newState.volume * 100}%`
        }
      };
    }
  }));

  return dom;
}

function mute(state, dispatch, parentClassName) {
  return button({
    className: state.isMuted ? `${parentClassName}__button` : `${parentClassName}__button--hide`,
    onclick: () => {
      dispatch(actions.uiVolumeButton("click", "volume-button"));
    },
    update: (newState) => {
      const flag = newState.isMuted ? "" : "--hide";
      return {
        className: `${parentClassName}__button${flag}`,
        onclick: () => {
          if (newState.ui.showVolumeControls) {
            dispatch(actions.uiUnMute("click", "volume-button"));
          } else {
            dispatch(actions.uiVolumeButton("click", "volume-button"));
          }
        },
      };
    }
  }, "🔇");
}

function sound(state, dispatch, parentClassName) {
  return button({
    className: !state.isMuted ? `${parentClassName}__button` : `${parentClassName}__button--hide`,
    onclick: () => {
      dispatch(actions.uiVolumeButton("click", "volume-button"));
    },
    update: (newState) => {
      const flag = !newState.isMuted ? "" : "--hide";
      return {
        className: `${parentClassName}__button${flag}`,
        onclick: () => {
          if (newState.ui.showVolumeControls) {
            dispatch(actions.uiMute("click", "volume-button"));
          } else {
            dispatch(actions.uiVolumeButton("click", "volume-button"));
          }
        },
      };
    }
  }, "🔊");
}

export default volume;
