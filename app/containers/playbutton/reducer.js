const defaultState = {
  show: false,
  playing: false
};

function playButtonReducer(state = defaultState, action) {
  switch (action.type) {
    case "PLAY":
      return Object.assign({}, state, {
        playing: true
      });
    default:
      return state;
  }
}

export default playButtonReducer;
