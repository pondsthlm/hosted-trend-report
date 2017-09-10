import logger from "../logger.js";
import ui from "../ui";
import player from "../player";

function observeVideo(store, id) {
  let updates;

  store.subscribe(() => {
    const state = store.getState();

    // Check if video ui needs to update
    if (state.player.videos[id].ui && state.player.videos[id].ui.updates !== updates) {

      logger.log(`Update video ${id}`);

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

      // Update ui component
      ui.components.update(state.player.videos[id].ui, localDispatch);
      updates = state.player.videos[id].ui.updates;
    }
  });
}

const uiMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER:
      // Setup store subscriber
      observeVideo(store, action.payload.id);
      break;

    default:
      break;
  }
  next(action);
};

export default uiMiddleware;
