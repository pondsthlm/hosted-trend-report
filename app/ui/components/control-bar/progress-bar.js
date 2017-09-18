import { div } from "../../../helpers/make-element";
import actions from "../../../player/actions";

import "./progress-bar.styl";


function progressBar(state, dispatch, parentClassName) {
  const className = "progress-bar";
  const bemParent = parentClassName ? `${parentClassName}__` : "";

  return div(
    {className: `${bemParent}${className} ${className}`},
    scrubber(state, dispatch, className),
  );
}

function calculateProgressPercent(state) {
  return `${(state.currentTime / state.duration) * 100}%`;
}

function scrubber(state, dispatch, parentClassName) {

  const dom = div(
    {
      className: `${parentClassName}__scrubber`,
      onmousedown: (event) => {
        const percent = event.offsetX / scrubber.offsetWidth;
        const newTime = percent * state.duration;
        dispatch(actions.setTime(newTime));
      }
    },
    progress(state, dispatch, parentClassName)
  );

  dom.update((newState) => {
    return {
      onmousedown: (event) => {
        const percent = event.offsetX / scrubber.offsetWidth;
        const newTime = percent * newState.duration;
        dispatch(actions.setTime(newTime));
      }
    };
  });

  return dom;
}

function progress(state, dispatch, parentClassName) {

  const dom = div({
    className: `${parentClassName}__progress`,
    style: {
      width: calculateProgressPercent(state)
    }
  });

  dom.update((newState) => {
    return {
      style: {
        width: calculateProgressPercent(newState)
      }
    };
  });
}


export default progressBar;
