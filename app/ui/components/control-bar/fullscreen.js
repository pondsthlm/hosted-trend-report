import { button, div } from "../../../helpers/make-element";
import actions from "../../../player/actions";

let bemParent = "";

const fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement("video").webkitRequestFullScreen);

function fullscreen(state, dispatch, parentClassName) {
  if (!fullScreenEnabled) {
    return div("");
  }
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  return div({
    className: `${bemParent}fullscreen`,
  }, button({
    className: `${bemParent}fullscreen-button`,
    onclick: () => {
      dispatch(actions.uiFullscreen("click", "fullscreen-button"));
      /*
      if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
      else if (videoContainer.mozRequestFullScreen) videoContainer.mozRequestFullScreen();
      else if (videoContainer.webkitRequestFullScreen) {
          // Safari 5.1 only allows proper fullscreen on the video element. This also works fine on other WebKit browsers as the following CSS (set in styles.css) hides the default controls that appear again, and
          // ensures that our custom controls are visible:
        video.webkitRequestFullScreen();
      }
      else if (videoContainer.msRequestFullscreen) videoContainer.msRequestFullscreen();
      this.setFullscreenData(true);
      */

    }
  }, "⇱"));
}

export default fullscreen;
