/**
* Inspect the client to see what it's capable of, this
* should only happens once per runtime.
*/
function capabilities(UA) {
  const detected = {};
  detected.isMobileDevice = /(iphone|ipod|ipad|android)/gi.test(UA);
  detected.isChrome = /chrome/i.test(UA) && !/edge/i.test(UA);

  const testElement = document.createElement('div');

  detected.transforms3d = 'WebkitPerspective' in testElement.style ||
  'MozPerspective' in testElement.style ||
  'msPerspective' in testElement.style ||
  'OPerspective' in testElement.style ||
  'perspective' in testElement.style;

  detected.transforms2d = 'WebkitTransform' in testElement.style ||
  'MozTransform' in testElement.style ||
  'msTransform' in testElement.style ||
  'OTransform' in testElement.style ||
  'transform' in testElement.style;

  detected.requestAnimationFrameMethod = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
  detected.requestAnimationFrame = typeof detected.requestAnimationFrameMethod === 'function';

  detected.canvas = !!document.createElement('canvas' ).getContext;

  // Transitions in the overview are disabled in desktop and
  // Safari due to lag
  detected.overviewTransitions = !/Version\/[\d.]+.*Safari/.test(UA);

  // Flags if we should use zoom instead of transform to scale
  // up slides. Zoom produces crisper results but has a lot of
  // xbrowser quirks so we only use it in whitelsited browsers.
  detected.zoom = 'zoom' in testElement.style && !detected.isMobileDevice &&
  (detected.isChrome || /Version\/[\d.]+.*Safari/.test(UA ));

  return detected;

}

export default capabilities;
