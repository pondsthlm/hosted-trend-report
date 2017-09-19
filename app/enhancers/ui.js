import logger from "../logger.js";
import ui from "../ui";
import player from "../player";

let latestId;
function observeVideo(store, id) {
  let dom;
  // Removing id complexity for dispatches
  const localDispatch = (action) => {
    let previousState = {};
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

    if (!dom) {
      logger.log(`Render video ${id}`, videoState);
      dom = ui.components.render(videoState, localDispatch);

      return;
    }

    // Update ui component
    dom.newState(videoState, latestId);
  });
}

const uiMiddleware = (store) => (next) => (action) => {
  latestId = action.payload.id ? action.payload.id : null;

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
