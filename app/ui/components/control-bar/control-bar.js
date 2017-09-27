import "./control-bar.styl";

import transpileJSX from "../../helpers/transpile-jsx"
import actions from "../../../player/actions";

import play from "./play";
import pause from "./pause";
import volume from "./volume";
import progressBar from "./progress-bar";
import fullscreenButton from "./fullscreen";

const name = "control-bar";
const hideDuration = 4000;
let hideTimeout;
let showControls

function setHideTimeout(dispatch) {
  if (hideTimeout) clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => dispatch(actions.hideControls()), hideDuration);
}

function controlBar(state, dispatch) {
  //const dom = controlBarDOM(state, dispatch);
  if (!showControls && state.ui.showControls && state.isPlaying) {
    setHideTimeout(dispatch)
  }
  if (!state.ui.showControls && hideTimeout) {
    clearTimeout(hideTimeout)
  }
  showControls = state.ui.showControls;
  let className = name
  if (!state.ui.showControls) {
    className= `${name} ${name}--hide`
  }

  return (
    <div name={name} className= {className} onclick={(el, e) => setHideTimeout(dispatch)}>
      {state.isPlaying ? pause(state, dispatch, name) : play(state, dispatch, name)}
      {volume(state, dispatch, name)}
      {progressBar(state, dispatch, name)}
      {fullscreenButton(state, dispatch, name)}
    </div>
  );

  return dom;
}

export default controlBar;
