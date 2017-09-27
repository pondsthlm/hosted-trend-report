import transpileJSX from "../../helpers/transpile-jsx";
import pause from "./pause";
import roll from "./roll";


import "./break-overlay.styl";

const name = "break-overlay";

function breakOverlay(state, dispatch) {

  return (
    <div className={name}>
      {state.display === "pause-ad" ? pause(state, dispatch, name) : roll(state, dispatch, name)}
    </div>
  );
}

export default breakOverlay;
