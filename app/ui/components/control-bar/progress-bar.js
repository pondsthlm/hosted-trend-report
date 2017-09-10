import { div, progress } from "../../../helpers/make-element";
import "./progress-bar.styl";

let bemParent = "";
const className = "progress-bar";

function progressBar(state, dispatch, parentClassName) {
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  /*
  <div class="progress">
       <progress id="progress" value="0" min="0">
         <span id="progress-bar"></span>
       </progress>
     </div>
     */

  return div(
    {
      className: `${bemParent}${className} ${className}`,
    },
    progress(
      {
        className: `${className}__progress`,
        value: state.currentTime,
        max: state.duration
      }
    )
  );
}

export default progressBar;
