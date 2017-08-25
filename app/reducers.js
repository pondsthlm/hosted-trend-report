import { combineReducers } from "redux";
import player from "./player";
import ui from "./ui";

function reducers() {
  return combineReducers({
    [player.constants.NAME]: player.reducer,
    [ui.constants.NAME]: ui.reducer
  });
}

export default reducers;
