import { applyMiddleware, compose } from "redux";
import hls from "./hls";
import ooyala from "./ooyala";

function middlewares() {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return composeEnhancers(applyMiddleware(...[hls, ooyala])); //TODO: Load middlewares
}

export default middlewares;
