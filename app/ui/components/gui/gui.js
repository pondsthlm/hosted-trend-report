import imageOptimizer from "../../helpers/image-optimizer"
import controlBar from "../control-bar/control-bar";
//import adOverlay from "../ad-overlay/ad-overlay";

import transpileJSX from "../../helpers/transpile-jsx"
const className = "video-gui";

function guiDOM(state, dispatch) {
  return div(
    {
      className,
    },

    //controlBar(state, dispatch),
    //adOverlay(state, dispatch)
  );
}

function getVideoElement(state) {
  if (state.autoPlay) {
    return (
      <video className="exp-video" poster={imageOptimizer(state.source.image)} autoplay="true"></video>
    );
  } else {
    return (
      <video className="exp-video" poster={imageOptimizer(state.source.image)}></video>
    );
  }
}

function gui(state, dispatch) {
  //const dom = guiDOM(state, dispatch);
  //adOverlay(state, dispatch)
  return (
    <div className="video-gui">
      {getVideoElement(state)}
      <div className="ad-video"> </div>
      {controlBar(state, dispatch)}
    </div>
  );
}

export default gui;
