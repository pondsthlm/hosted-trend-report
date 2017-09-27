import transpileJSX from "../../helpers/transpile-jsx";
import countdown from "./countdown";

import "./roll.styl";

const name = "roll";

function roll(state, dispatch, parentClassName) {
  const bemParent = parentClassName ? `${parentClassName}__` : "";

  return (
    <div className={`${bemParent}${name}`}>
      {countdown(state, dispatch, parentClassName)}
    </div>
  );
}

export default roll;
