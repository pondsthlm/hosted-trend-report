import { combineReducers } from "redux";
import counter from "./containers/counter";

function reducers() {
  return combineReducers({
    [counter.constants.NAME]: counter.reducer
  });
}

export default reducers;
