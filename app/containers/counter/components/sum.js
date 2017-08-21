import selectors from "../selectors";
function sum(store) {
  const state = store.getState();
  return selectors.getSum(state);
}

export default sum;
