import { createStore } from "redux";
import middlewares from "./middleware/index.js";
import reducers from "./reducers";

import counter from "./containers/counter";
import { div } from "./helpers/make-element";


const store = createStore(reducers(), {}, middlewares());

store.subscribe(() => {
  console.log("store updated", store.getState());
});
document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(
    div({ id: "app" }, counter.components.sum(store))
  );
});

store.dispatch(counter.actions.add(10));
