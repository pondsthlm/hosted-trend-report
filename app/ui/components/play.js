
import { button } from "../../helpers/make-element";
import { clickPlay, clickPause } from "../actions";
import { NAME } from "../constants";

let bemParent = "";

function playButton(store, id) {
  return button({
    className: `${bemParent}play-button`,
    onclick: () => {
      store.dispatch(clickPlay(id));
    }
  }, "▶");
}

function pauseButton(store, id) {
  return button({
    className: `${bemParent}pause-button`,
    onclick: () => {
      store.dispatch(clickPause(id));
    }
  }, "||");
}

function play(store, id, parentClassName) {
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  const state = store.getState();
  if (state[NAME].playing) {
    return pauseButton(store, id);
  } else {
    return playButton(store, id);
  }
}

export default play;
