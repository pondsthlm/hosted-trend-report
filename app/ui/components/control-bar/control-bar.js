
import { div } from "../../../helpers/make-element";
import playPause from "./play-pause";
import "./control-bar.styl";
import volume from "./volume";
import progressBar from "./progress-bar";
import fullscreenButton from "./fullscreen";

const className = "control-bar";

function controlBarDOM(state, dispatch) {
  return div(
    {
      className,
    },
    playPause(state, dispatch, className),
    volume(state, dispatch, className),
    progressBar(state, dispatch, className),
    fullscreenButton(state, dispatch, className)
  );
}

function controlBar(state, dispatch) {
  const dom = controlBarDOM(state, dispatch);

  dom.update((newState) => {
    if (!newState.showControls) {
      return {
        className: `${className} ${className}--hide`
      };
    } else {
      return {
        className
      };
    }
  });

  return dom;
}

export default controlBar;
