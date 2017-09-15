import controlBar from "./control-bar/control-bar";

let dom;
function newState(state) {
  dom.newState(state);
}

function render(state, dispatch) {
  dom = controlBar(state, dispatch);
}

export default { newState, render };
