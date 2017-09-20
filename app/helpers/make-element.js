import logger from "../logger.js";

const attributeExceptions = [
  "role",
  "dataset",
  "d",
  "r",
  "cx",
  "cy",
  "width",
  "height",
  "viewBox",
  "fill",
  "max",
  "value"
];

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function appendText(el, text) {
  const textNode = document.createTextNode(text);
  el.appendChild(textNode);
}

function appendArray(el, children) {
  const elementChildren = [];
  children.forEach((child) => {
    if (Array.isArray(child)) {
      appendArray(el, child);
    } else if (child instanceof window.Element) {
      elementChildren.push(child);
      el.appendChild(child);
    } else if (typeof child === "string" || typeof child === "number") {
      appendText(el, child);
    }
  });
  return elementChildren;
}

function setStyles(el, styles) {
  if (!styles) {
    el.removeAttribute("styles");
    return;
  }

  Object.keys(styles).forEach((styleName) => {
    if (styleName in el.style) {
      el.style[styleName] = styles[styleName];
    } else {
      // console.warn(`${styleName} is not a valid style for a <${el.tagName.toLowerCase()}>`);
    }
  });
}

function setDataAttributes(el, dataAttributes) {
  Object.keys(dataAttributes).forEach((dataAttribute) => {
    // jsdom doesn't support element.dataset, so set them as named attributes
    el.setAttribute(`data-${dataAttribute}`, dataAttributes[dataAttribute]);
  });
}

function isSvg(type) {
  return ["path", "svg", "circle"].includes(type);
}

function setElementProperties(properties, el) {
  Object.keys(properties).forEach((propName) => {
    if (propName in el || attributeExceptions.includes(propName)) {
      const value = properties[propName];
      if (propName === "style") {
        setStyles(el, value);
      } else if (typeof value === "function" && propName === "update") {
        el.update(value); // callback function when its a new state
      } else if (propName === "dataset") {
        setDataAttributes(el, value);
      } else if (typeof value === "function" || propName === "className") {
        el[propName] = value; // e.g. onclick
      } else if (value) {
        el.setAttribute(propName, value); // need this for SVG elements
      }
    } else {
      //console.warn(`${propName} is not a valid property of a <${type}>`);
    }
  });
  return el;
}

function makeElement(type, textOrPropsOrChild, ...otherChildren) {
  let children = [];
  let el = isSvg(type)
    ? document.createElementNS(SVG_NAMESPACE, type)
    : document.createElement(type);
  let update = () => {};

  el.update = (fn) => {
    update = fn;
  };
  el.videoId = null;
  el.setVideoId = (id) => {
    el.videoId = id;
    children.forEach((child) => {
      child.setVideoId(id);
    });
  };

  el.newState = (state, id) => {
    if (id === el.videoId) {
      const object = update(state);
      if (object) {
        setElementProperties(object, el);
      }
    }
    children.forEach((child) => {
      child.newState(state, id);
    });
  };

  if (Array.isArray(textOrPropsOrChild)) {
    children = children.concat(appendArray(el, textOrPropsOrChild));
  } else if (textOrPropsOrChild instanceof window.Element) {
    children.push(textOrPropsOrChild);
    el.appendChild(textOrPropsOrChild);
  } else if (typeof textOrPropsOrChild === "string" || typeof textOrPropsOrChild === "number") {
    appendText(el, textOrPropsOrChild);
  } else if (typeof textOrPropsOrChild === "object") {
    el = setElementProperties(textOrPropsOrChild, el);
  }

  if (otherChildren) {
    children = children.concat(appendArray(el, otherChildren));
  }

  return el;
}

export const a = (...args) => makeElement("a", ...args);
export const button = (...args) => makeElement("button", ...args);
export const div = (...args) => makeElement("div", ...args);
export const h1 = (...args) => makeElement("h1", ...args);
export const h2 = (...args) => makeElement("h2", ...args);
export const header = (...args) => makeElement("header", ...args);
export const p = (...args) => makeElement("p", ...args);
export const span = (...args) => makeElement("span", ...args);
export const video = (...args) => makeElement("video", ...args);
export const progress = (...args) => makeElement("progress", ...args);

export const ul = (...args) => makeElement("ul", ...args);
export const li = (...args) => makeElement("li", ...args);

export const svg = (...args) => makeElement("svg", ...args);
export const path = (...args) => makeElement("path", ...args);
export const circle = (...args) => makeElement("circle", ...args);
