import "./control-bar.styl";

import transpileJSX from "../../helpers/transpile-jsx"
import play from "./play";
import pause from "./pause";
import volume from "./volume";
import progressBar from "./progress-bar";
import fullscreenButton from "./fullscreen";




const name = "control-bar";

function controlBar(state, dispatch) {
  //const dom = controlBarDOM(state, dispatch);
  let className = name
  if (!state.ui.showControls) {
    className= `${name} ${name}--hide`
  }

  return (
    <div name={name} className= {className}>
      {state.isPlaying ? pause(state, dispatch, name) : play(state, dispatch, name)}
      {volume(state, dispatch, name)}
      {progressBar(state, dispatch, name)}
      {fullscreenButton(state, dispatch, className)}
    </div>
  );

  return dom;
}

export default controlBar;
