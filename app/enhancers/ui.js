import logger from "../logger.js";
import ui from "../ui";
import player from "../player";

function observeVideo(store, id) {
  let isRendered = false;
  // Removing id complexity for dispatches
  const localDispatch = (action) => {
    // Decorate with id
    action = Object.assign({}, action, {
      ...action,
      payload: {
        ...action.payload,
        id
      }
    });
    store.dispatch(action);
  };


  store.subscribe(() => {
    const state = store.getState();
    const videoUIState = state.player.videos[id].ui;

    if (!isRendered) {
      logger.log(`Render video ${id}`, videoUIState);
      ui.components.render(videoUIState, localDispatch);
      isRendered = true;

      return;
    }

    logger.log(`Update video ${id}`, videoUIState);

    // Update ui component
    ui.components.newState(videoUIState);
  });
}

const uiMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:
      // Setup store subscriber
      console.log("ACTION", action);
      observeVideo(store, action.payload.id);
      break;

    default:
      break;
  }
  next(action);
};

export default uiMiddleware;
