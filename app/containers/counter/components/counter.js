
import { div } from "../../../helpers/make-element";
import "./counter.styl";
import addButton from "./add-button";
import sum from "./sum";

function counter(store) {
  return div({
    className: "counter",
  }, addButton(store), sum(store));
}

export default counter;
