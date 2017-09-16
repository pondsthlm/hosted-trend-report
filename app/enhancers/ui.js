import logger from "../logger.js";
import ui from "../ui";
import player from "../player";

function observeVideo(store, id) {
  let dom;
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
    console.log("##########", dom);
    if (!dom) {
      logger.log(`Render video ${id}`, videoUIState);
      dom = ui.components.render(videoUIState, localDispatch);

      return;
    }

    logger.log(`Update video ${id}`, videoUIState);
    // Update ui component
    dom.newState(videoUIState);
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
