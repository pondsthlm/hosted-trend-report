import transpileJSX from "../../helpers/transpile-jsx"
import actions from "../../../player/actions";

import "./progress-bar.styl";

const name = "related-content";

function relatedContent(state, dispatch, parentClassName) {
  const bemParent = parentClassName ? `${parentClassName}__` : "";
  const className = `${bemParent}${name}`;

  return (
    <div className={name}></div>
  )
}

export default relatedContent;
