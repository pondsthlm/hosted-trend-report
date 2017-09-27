import player from "../player";

function videoEvents(store, videoElement, elementContainer) {
  let resizeTimeout;
  let width;

  function fullscreenChange() {
    store.dispatch(player.actions.fullscreenChange());
  }

  elementContainer.addEventListener("webkitfullscreenchange", fullscreenChange, false);
  elementContainer.addEventListener("mozfullscreenchange", fullscreenChange, false);
  elementContainer.addEventListener("fullscreenchange", fullscreenChange, false);
  elementContainer.addEventListener("MSFullscreenChange", fullscreenChange, false);

  videoElement.addEventListener("timeupdate", () => {
    store.dispatch(player.actions.timeupdate(videoElement.currentTime));
  }, true);
  videoElement.addEventListener("ended", () => {
    store.dispatch(player.actions.contentEnded());
  }, true);
  videoElement.addEventListener("click", () => {
    store.dispatch(player.actions.contentClicked());
  }, true);
  videoElement.addEventListener("durationchange", () => {
    store.dispatch(player.actions.durationChange(videoElement.duration));
  }, true);
  window.addEventListener("resize", () => {
    clearInterval(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (videoElement.getBoundingClientRect().width !== width) {
        width = videoElement.getBoundingClientRect().width;
        store.dispatch(player.actions.sizeChange(width));
      }

    }, 500);

  }, true);
}

export default videoEvents;
