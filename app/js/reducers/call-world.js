import { HELLO_WORLD } from "../actions/constants";

const initialState = { text: ""};

function callWorld(state = initialState, action) {
  switch (action.type) {
    case HELLO_WORLD:
      return Object.assign({}, state, {
        text: action.text
      });
    default:
      return state;
  }
}

export default callWorld;
