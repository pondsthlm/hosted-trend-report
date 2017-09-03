import { compose } from "redux";
import hls from "./hls";
import ooyala from "./ooyala";
import ui from "./ui";

function applyMiddleware(...customEnhancers) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    let dispatch = store.dispatch;
    let chain = [];

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args),
      subscribe: store.subscribe
    };
    chain = customEnhancers.map((customEnhancer) => customEnhancer(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch
    };
  };
}

function middlewares() {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return composeEnhancers(applyMiddleware(hls, ooyala, ui));
}

export default middlewares;
