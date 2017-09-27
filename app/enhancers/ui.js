import logger from "../logger.js";
import ui from "../ui";
import player from "../player";
import updateElements from "../helpers/update-elements";

function observeVideo(store) {
  let oldNode;

  const id = Math.random().toString(36).substr(2, 9);

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
    const newNode = ui.components.get(videoState, localDispatch);
    if (!oldNode) {
      oldNode = newNode;
      updateElements(videoState.elementContainer, newNode);
      videoState.elementContainer.classList.add("exp-player");
      localDispatch({
        type: player.constants.DOM_READY,
        payload: {
          elementContainer: videoState.elementContainer
        }
      });

      return;
    }

    updateElements(videoState.elementContainer, newNode, oldNode);
    oldNode = newNode;
  });

  return id;
}

const uiMiddleware = (store) => (next) => (action) => {

  switch (action.type) {
    case player.constants.SETUP_NEW_PLAYER: {
      // Setup store subscriber
      const id = observeVideo(store, action.payload.id);
      action = Object.assign({}, action, {
        payload: {
          ...action.payload,
          id
        }
      });
    }
      break;

    default:
      break;
  }
  next(action);
};

export default uiMiddleware;
