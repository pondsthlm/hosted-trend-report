import { div } from "../../helpers/make-element";
import "./progress-bar.styl";

let bemParent = "";
const className = "progress-bar";

function progressBar(store, id, parentClassName) {
  if (parentClassName) {
    bemParent = `${parentClassName}__`;
  }
  return div(
    {
      className: `${bemParent}${className}`,
    },
    div(
      {
        className,
      },
      div({
        className: `${className}__duration`,
      }, "00"),
      div({
        className: `${className}__bar`,
      },
        div({
          className: `${className}__progress`,
          style: {
            width: "50%"
          }
        }, ""),
        div({
          className: `${className}__scrub`,
        }, "")),
      div({
        className: `${className}__total`,
      }, "88")
    )
  );
}

export default progressBar;
