import Hls from "hls.js/dist/hls.light.min.js";

function run () {
  if (Hls.isSupported()) {
    const video = document.getElementById("video");
    const hls = new Hls();
    hls.loadSource("http://httpcache0.03837-cachelive2.dna.qbrick.com/03837-cachelive2/smil:03837_tx2_720p/playlist.m3u8");
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
  }
}

run();
