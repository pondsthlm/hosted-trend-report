import transpileJSX from "../../helpers/transpile-jsx"
import actions from "../../../player/actions";

import "./fullscreen.styl";
let bemParent = "";

const fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement("video").webkitRequestFullScreen);

function fullscreen(state, dispatch, parentClassName) {
  if (!fullScreenEnabled) {
    return (<span></span>);
  }
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  return (
    <div className={`${bemParent}fullscreen`}>
      <button className={`${bemParent}fullscreen-button`} onclick={(el, e) => dispatch(actions.uiFullscreen("click", "fullscreen-button"))}>
      </button>
    </div>
  );
}

export default fullscreen;
