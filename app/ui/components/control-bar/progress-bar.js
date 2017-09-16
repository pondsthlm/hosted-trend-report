import { div } from "../../../helpers/make-element";
import actions from "../../../player/actions";

import "./progress-bar.styl";

let bemParent = "";
const className = "progress-bar";

function calculateProgressPercent(state) {
  return `${(state.currentTime / state.duration) * 100}%`;
}

function progressBar(state, dispatch, parentClassName) {
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  const progress = div(
    {
      className: `${className}__progress`,
      style: {
        width: calculateProgressPercent(state)
      }
    }
  );

  progress.update((state) => {
    const object = {
      style: {
        width: calculateProgressPercent(state)
      }
    };

    return object;
  });

  const scrubber = div(
    {
      className: `${className}__scrubber`,
      onmousedown: (event) => {
        const percent = event.offsetX / scrubber.offsetWidth;
        const newTime = percent * state.duration;
        console.log(newTime, state.duration, event.offsetX, scrubber.offsetWidth);
        dispatch(actions.setTime(newTime));
      }
    }, progress);


  return div(
    {
      className: `${bemParent}${className} ${className}`,
    },
    scrubber,
  );
}

export default progressBar;
