function sum(store) {
  const state = store.getState();
  return state.counter.sum;
}

export default sum;
