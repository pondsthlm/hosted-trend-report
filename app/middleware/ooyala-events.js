import logger from "../logger.js";

function ooyalaEvents(store, id) {
  return {
    startContentPlayback: () => {
      store.dispatch({
        type: "CONTENT_PLAY",
        payload: {
          id
        }
      });
      logger.log("Starting the content playback");
    },
    pauseContentPlayback: () => {
      store.dispatch({
        type: "CONTENT_PAUSE",
        payload: {
          id
        }
      });
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
