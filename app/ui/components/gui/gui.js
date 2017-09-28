import imageOptimizer from "../../helpers/image-optimizer"
import controlBar from "../control-bar/control-bar";
import breakOverlay from "../break-overlay/break-overlay";
import playNext from "../post-content/play-next";
import relatedContent from "../post-content/play-next";

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

function isAdBrake(state) {
  return (state.display === "pause-ad" || state.display === "preroll" || state.display === "postroll")
}

function postContent(state, dispatch) {
  if (state.playNext) {
    return playNext(state, dispatch);
  }
  return relatedContent(state, dispatch);
}

function gui(state, dispatch) {
  //const dom = guiDOM(state, dispatch);
  //adOverlay(state, dispatch)
  return (
    <div className="video-gui">
      {getVideoElement(state)}
      <div className="ad-video"></div>
      {controlBar(state, dispatch)}
      {isAdBrake(state) ? breakOverlay(state, dispatch) : <span></span>}
      {(state.display === "post-content") ? postContent(state, dispatch) : <span></span>}
    </div>
  );
}

export default gui;
