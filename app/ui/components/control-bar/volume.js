import { button, div } from "../../../helpers/make-element";

let bemParent = "";

function volume(state, dispatch, parentClassName) {
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  return div({
    className: `${bemParent}volume`,
  }, button({
    className: `${bemParent}volume-button`,
  }, "🔊"));
}

export default volume;
