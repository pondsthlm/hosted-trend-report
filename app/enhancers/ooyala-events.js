import logger from "../logger.js";
import player from "../player";

function ooyalaEvents(store, id) {
  return {
    startContentPlayback: () => {
      store.dispatch(player.actions.contentPlay(id));
      logger.log("Starting the content playback");
    },
    pauseContentPlayback: () => {
      store.dispatch(player.actions.contentPause(id));
      logger.log("Pausing the content playback and hide our player");
    },
    illegalOperationOccurred: (message) => {
      logger.warn(`Illegal operation: ${message}`);
    },
    sessionEnded: () => {
      logger.log("Session ended!");
    },
    openClickThrough: (url) => {
      store.dispatch({
        type: "ADD_CLICK_THROUGH",
        payload: {
          url,
          id
        }
      });
      window.open(url);
      //Tell the SDK the clickthrough URL was opened, so the associated VAST event can be tracked
      //adPlayer.adClickThroughOpened();
    }
  };
}

export default ooyalaEvents;
