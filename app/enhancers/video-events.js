import player from "../player";

function videoEvents(store, videoElement) {
  let currentTime = -1;
  let resizeTimeout;
  let width;
  videoElement.addEventListener("timeupdate", () => {
    // Limit distatch to max 1 per second
    if (currentTime !== Math.floor(videoElement.currentTime)) {
      currentTime = Math.floor(videoElement.currentTime);
      store.dispatch(player.actions.timeupdate(currentTime));
    }
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
