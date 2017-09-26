
import transpileJSX from "../../helpers/transpile-jsx"
import actions from "../../../player/actions";

const name = "pause-button";

function clickPause(event, dispatch) {
  dispatch(actions.uiPause("click", "pause-button"));
}

function pause(state, dispatch, parentClassName) {
  const bemParent = parentClassName ? `${parentClassName}__` : "";
  const className = `${bemParent}${name}`;

  return (
    <button name={name} className={className} onclick={(e) => clickPause(e, dispatch)}>||</button>
  )
}

export default pause;
