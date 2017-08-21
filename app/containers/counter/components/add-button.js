
import { button } from "../../../helpers/make-element";
import { add } from "../actions";

function addButton(store) {
  return button({
    onclick: () => {
      store.dispatch(add(1));
    }
  }, "+1");
}

export default addButton;
