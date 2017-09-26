/** @jsx transpileJSX */

 function transpileJSX(type, props, ...children) {
  return { type, props: props || {}, children };
}

export default transpileJSX;
