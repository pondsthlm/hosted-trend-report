import transpileJSX from "../../helpers/transpile-jsx"
import actions from "../../../player/actions";

import "./volume.styl";
const name = "volume";

function volume(state, dispatch, parentClassName) {
  const bemParent = parentClassName ? `${parentClassName}__` : "";
  const className = `${bemParent}${name}`;
  return (
    <div className={className}>
      {state.isMuted ? mute(state, dispatch, name) : sound(state, dispatch, name)}
      {volumeControl(state, dispatch, name)}
    </div>
  );
}

function changeVolume(element, event, dispatch) {
  const offsetY = event.clientY - element.getBoundingClientRect().top;
  const percent = element.offsetHeight ? offsetY / element.offsetHeight : 0;
  dispatch(actions.uiVolumeControler(1 - percent));
}

function volumeControl(state, dispatch, parentClassName) {
  if (!state.ui.showVolumeControls) {
    return (<span></span>);
  }
  return (
    <div className={`${parentClassName}__control`} onmousedown={(el, e) => changeVolume(el, e, dispatch)}>
      <div className={`${parentClassName}__indicator`} style={`height: ${state.volume * 100}%`}>
      </div>
    </div>
  );
}

function iconClicked(dispatch, state) {
  if (state.ui.showVolumeControls) {
    if (state.isMuted) {
      dispatch(actions.uiUnMute("click", "volume-button"));
    } else {
      dispatch(actions.uiMute("click", "volume-button"));
    }
  } else {
    dispatch(actions.uiVolumeButton("click", "volume-button"));
  }
}

function sound(state, dispatch, parentClassName) {
  return (
    <button className={`${parentClassName}__button`} onclick={(el, e) => iconClicked(dispatch, state)}>
    </button>
  );
}

function mute(state, dispatch, parentClassName) {
  return (
    <button className={`${parentClassName}__button--mute`} onclick={(el, e) => iconClicked(dispatch, state)}>
    </button>
  );
}

export default volume;
