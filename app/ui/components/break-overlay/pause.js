import transpileJSX from "../../helpers/transpile-jsx";
import play from "../control-bar/play";

const name = "pause";

function pause(state, dispatch, parentClassName) {

  return (
    <div>
      {play(state, dispatch, parentClassName)}
    </div>
  );
}

export default pause;
