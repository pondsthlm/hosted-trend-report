import { applyMiddleware, compose } from "redux";

function middlewares() {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return composeEnhancers(applyMiddleware(...[])); //TODO: Load middlewares
}

export default middlewares;
