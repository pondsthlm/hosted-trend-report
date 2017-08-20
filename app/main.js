import { createStore } from "redux";
import middlewares from "./middleware/index.js";
import reducers from "./reducers";

import counter from "./containers/counter";
import { div } from "./helpers/make-element";


const store = createStore(reducers(), {}, middlewares());

store.subscribe(() => {
  render();
});
document.addEventListener("DOMContentLoaded", () => {
  store.dispatch(counter.actions.add(10));
  render();
});

function render() {
  const app = div({ id: "app" }, counter.components.sum(store), counter.components.addButton(store));
  if (document.body.isEqualNode(app)) {
    return;
  }
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  document.body.appendChild(
    div({ id: "app" }, counter.components.sum(store), counter.components.addButton(store))
  );
}
