import transpileJSX from "../../helpers/transpile-jsx"
import actions from "../../../player/actions";

import "./progress-bar.styl";
const name = "progress-bar";

function progressBar(state, dispatch, parentClassName) {
  const bemParent = parentClassName ? `${parentClassName}__` : "";

  return (
    <div className={`${bemParent}${name}`}>
      <div className={`${name}__scrubber`} onmousedown={(el, event) => clickProgress(state, event, el, dispatch)}>
        <div className={`${name}__progress`} style={`width: ${calculateProgressPercent(state)}`}></div>
      </div>
    </div>
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

export default progressBar;
