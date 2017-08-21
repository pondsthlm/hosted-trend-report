// Container subspace for manipulating state.
import * as constants from "./constants";

const defaultState = {
  sum: 1
};

const counterReducer = (state = defaultState, action) => {
  switch (action.type) {
    case constants.ADD:
      state = Object.assign({}, state, {
        sum: state.sum + action.payload
      });
      break;
    case constants.SUBTRACT:
      break;
    default:
  }

  return state;
};

export default counterReducer;
