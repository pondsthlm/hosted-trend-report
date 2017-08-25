import { button, div } from "../../helpers/make-element";

let bemParent = "";

function fullscreen(store, parentClassName) {
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  return div({
    className: `${bemParent}fullscreen`,
  }, button({
    className: `${bemParent}fullscreen-button`,
  }, "⇱"));
}

export default fullscreen;
