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

function clickProgress(state, event, dom, dispatch) {
  if (!state.duration) return;
  const offsetX = event.clientX - dom.getBoundingClientRect().left;
  const percent = offsetX / dom.offsetWidth;
  const newTime = percent * state.duration;
  dispatch(actions.setTime(newTime));
}

function scrubber(state, dispatch, parentClassName) {

  const dom = div(
    {
      className: `${parentClassName}__scrubber`,
      onmousedown: (event) => {
        clickProgress(state, event, dom, dispatch);
      },
      update: (newState) => {
        return {
          onmousedown: (event) => {
            clickProgress(newState, event, dom, dispatch);
          }
        };
      }
    },
    progress(state, dispatch, parentClassName)
  );

  return dom;
}

function progress(state, dispatch, parentClassName) {

  const dom = div({
    className: `${parentClassName}__progress`,
    style: {
      width: calculateProgressPercent(state)
    },
    update: (newState) => {
      return {
        style: {
          width: calculateProgressPercent(newState)
        }
      };
    }
  });

  return dom;
}


export default progressBar;
