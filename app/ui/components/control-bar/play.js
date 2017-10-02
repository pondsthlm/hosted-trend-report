import transpileJSX from "../../helpers/transpile-jsx"
import actions from "../../../player/actions";

import "./play.styl";

const name = "play-button";

function clickPlay(dispatch) {
  dispatch(actions.uiPlay("click", "play-button"));
}

function play(state, dispatch, parentClassName) {
  const bemParent = parentClassName ? `${parentClassName}__` : "";
  const className = `${bemParent}${name}`;

  return (
    <button name={name} className={className} onclick={() => clickPlay(dispatch)}></button>
  )
}

export default play;
