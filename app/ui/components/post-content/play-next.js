import transpileJSX from "../../helpers/transpile-jsx"
import actions from "../../../player/actions";

const name = "play-next";

function playNext(state, dispatch, parentClassName) {
  const bemParent = parentClassName ? `${parentClassName}__` : "";
  const className = `${bemParent}${name}`;

  return (
    <div className={name}></div>
  )
}

export default playNext;
