import { button, div } from "../../helpers/make-element";

let bemParent = "";

function volume(store, id, parentClassName) {
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
