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
    const videoState = state.player.videos[id];
    console.log("##########", dom);
    if (!dom) {
      logger.log(`Render video ${id}`, videoState);
      dom = ui.components.render(videoState, localDispatch);

      return;
    }

    logger.log(`Update video ${id}`, videoState);
    // Update ui component
    dom.newState(videoState);
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
