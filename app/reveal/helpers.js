
/**
* Converts the target object to an array.
*
* @param {object} o
* @return {object[]}
*/
function toArray(o) {
  return Array.prototype.slice.call(o);
}

/**
* Utility for deserializing a value.
*
* @param {*} value
* @return {*}
*/
function deserialize(value) {

  if (typeof value === 'string') {
    if (value === 'null' ) return null;
    else if (value === 'true' ) return true;
    else if (value === 'false' ) return false;
    else if (value.match(/^-?[\d.]+$/)) return parseFloat(value);
  }

  return value;
}

/**
* Measures the distance in pixels between point a
* and point b.
*
* @param {object} a point with x/y properties
* @param {object} b point with x/y properties
*
* @return {number}
*/
function distanceBetween(a, b) {

  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
* Applies a CSS transform to the target element.
*
* @param {HTMLElement} element
* @param {string} transform
*/
function transformElement(element, transform) {
  element.style.WebkitTransform = transform;
  element.style.MozTransform = transform;
  element.style.msTransform = transform;
  element.style.transform = transform;
}

/**
* Injects the given CSS styles into the DOM.
*
* @param {string} value
*/
function injectStyleSheet(value) {
  const tag = document.createElement('style');
  tag.type = 'text/css';
  if (tag.styleSheet) {
    tag.styleSheet.cssText = value;
  } else {
    tag.appendChild(document.createTextNode(value));
  }
  document.getElementsByTagName('head')[0].appendChild(tag);
}

/**
* Converts various color input formats to an {r:0,g:0,b:0} object.
*
* @param {string} color The string representation of a color
* @example
* colorToRgb('#000');
* @example
* colorToRgb('#000000');
* @example
* colorToRgb('rgb(0,0,0)');
* @example
* colorToRgb('rgba(0,0,0)');
*
* @return {{r: number, g: number, b: number, [a]: number}|null}
*/
function colorToRgb(color) {

  let hex3 = color.match(/^#([0-9a-f]{3})$/i);
  if (hex3 && hex3[1]) {
    hex3 = hex3[1];
    return {
      r: parseInt(hex3.charAt(0 ), 16 ) * 0x11,
      g: parseInt(hex3.charAt(1 ), 16 ) * 0x11,
      b: parseInt(hex3.charAt(2 ), 16 ) * 0x11
    };
  }

  let hex6 = color.match(/^#([0-9a-f]{6})$/i);
  if (hex6 && hex6[1]) {
    hex6 = hex6[1];
    return {
      r: parseInt(hex6.substr(0, 2 ), 16 ),
      g: parseInt(hex6.substr(2, 2 ), 16 ),
      b: parseInt(hex6.substr(4, 2 ), 16 )
    };
  }

  const rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgb) {
    return {
      r: parseInt(rgb[1], 10 ),
      g: parseInt(rgb[2], 10 ),
      b: parseInt(rgb[3], 10 )
    };
  }

  const rgba = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d]+|[\d]*.[\d]+)\s*\)$/i);
  if (rgba) {
    return {
      r: parseInt(rgba[1], 10 ),
      g: parseInt(rgba[2], 10 ),
      b: parseInt(rgba[3], 10 ),
      a: parseFloat(rgba[4] )
    };
  }

  return null;
}


/**
* Calculates brightness on a scale of 0-255.
*
* @param {string} color See colorToRgb for supported formats.
* @see {@link colorToRgb}
*/
function colorBrightness(color) {

  if (typeof color === 'string' ) color = colorToRgb(color);

  if (color) {
    return (color.r * 299 + color.g * 587 + color.b * 114 ) / 1000;
  }

  return null;
}

/**
* Returns the remaining height within the parent of the
* target element.
*
* remaining height = [ configured parent height ] - [ current parent height ]
*
* @param {HTMLElement} element
* @param {number} [height]
*/
function getRemainingHeight(element, height = 0) {

  if (element) {
    const oldHeight = element.style.height;

    // Change the .stretch element height to 0 in order find the height of all
    // the other elements
    element.style.height = '0px';
    const newHeight = height - element.parentNode.offsetHeight;

    // Restore the old height, just in case
    element.style.height = `${oldHeight}px`;

    return newHeight;
  }

  return height;
}


/**
* Checks if this instance is being used to print a PDF.
*/
function isPrintingPDF() {

  return (/print-pdf/gi ).test(window.location.search);
}


/**
* Causes the address bar to hide on mobile devices,
* more vertical space ftw.
*/
function removeAddressBar() {
  setTimeout( () => {
    window.scrollTo(0, 1);
  }, 10);
}

/**
* Stores the vertical index of a stack so that the same
* vertical slide can be selected when navigating to and
* from the stack.
*
* @param {HTMLElement} stack The vertical stack element
* @param {string|number} [v=0] Index to memorize
*/
function setPreviousVerticalIndex(stack, v) {
  if (typeof stack === 'object' && typeof stack.setAttribute === 'function') {
    stack.setAttribute('data-previous-indexv', v || 0);
  }
}


/**
* Retrieves the vertical index which was stored using
* #setPreviousVerticalIndex() or 0 if no previous index
* exists.
*
* @param {HTMLElement} stack The vertical stack element
*/
function getPreviousVerticalIndex(stack) {

  if (typeof stack === 'object' && typeof stack.setAttribute === 'function' && stack.classList.contains('stack' )) {
    // Prefer manually defined start-appState.indexv
    const attributeName = stack.hasAttribute('data-start-indexv' ) ? 'data-start-indexv' : 'data-previous-indexv';

    return parseInt(stack.getAttribute(attributeName ) || 0, 10);
  }

  return 0;
}

/**
* Handling the fullscreen functionality via the fullscreen API
*
* @see http://fullscreen.spec.whatwg.org/
* @see https://developer.mozilla.org/en-US/docs/DOM/Using_fullscreen_mode
*/
function enterFullscreen() {

  const element = document.documentElement;

  // Check which implementation is available
  const requestMethod = element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.webkitRequestFullScreen ||
    element.mozRequestFullScreen ||
    element.msRequestFullscreen;

  if (requestMethod) {
    requestMethod.apply(element);
  }

}


/**
* Applies HTML formatting to a slide number before it's
* written to the DOM.
*
* @param {number} a Current slide
* @param {string} delimiter Character to separate slide numbers
* @param {(number|*)} b Total slides
* @return {string} HTML string fragment
*/
function formatSlideNumber(a, delimiter, b) {

  if (typeof b === 'number' && !isNaN(b )) {
    return `<span class="slide-number-a">${a}</span>
      <span class="slide-number-delimiter">${delimiter}</span>
      <span class="slide-number-b">${b}</span>`;
  }

  return `<span class="slide-number-a">${a}</span>`;
}

/**
* Checks if this presentation is running inside of the
* speaker notes window.
*
* @return {boolean}
*/
function isSpeakerNotes() {
  return !!window.location.search.match(/receiver/gi);
}

export {
  toArray,
  deserialize,
  distanceBetween,
  transformElement,
  injectStyleSheet,
  colorToRgb,
  colorBrightness,
  getRemainingHeight,
  isPrintingPDF,
  setPreviousVerticalIndex,
  getPreviousVerticalIndex,
  enterFullscreen,
  removeAddressBar,
  formatSlideNumber,
  isSpeakerNotes
};
