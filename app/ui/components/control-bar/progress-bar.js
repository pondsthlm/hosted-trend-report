import { div, progress } from "../../../helpers/make-element";
import actions from "../../../player/actions";

import "./progress-bar.styl";

let bemParent = "";
const className = "progress-bar";

function progressBar(state, dispatch, parentClassName) {
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  const progressPercent = (state.currentTime / state.duration) * 100;
  /*
  <div class="progress">
       <progress id="progress" value="0" min="0">
         <span id="progress-bar"></span>
       </progress>
     </div>
     */
  const scrubber = div(
    {
      className: `${className}__scrubber`,
      onmousedown: (event) => {
        const percent = event.offsetX / scrubber.offsetWidth;
        const newTime = percent * state.duration;
        dispatch(actions.setTime(newTime));
      }
    }, div(
      {
        className: `${className}__progress`,
        style: {
          width: `${progressPercent}%`
        }
      }
    ));

  return div(
    {
      className: `${bemParent}${className} ${className}`,
    },
    scrubber,
  );
}

export default progressBar;
