import { combineReducers } from "redux";
import player from "./player";

function reducers() {
  return combineReducers({
    [player.constants.NAME]: player.reducer
  });
}

export default reducers;
