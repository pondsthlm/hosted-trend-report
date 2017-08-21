
import { button } from "../../../helpers/make-element";
import { add } from "../actions";
import "./add-button.styl";

function addButton(store) {
  return button({
    className: "add-button",
    onclick: () => {
      store.dispatch(add(1));
    }
  }, "+1");
}

export default addButton;
