// Collect actions overviewing what container can dispatch.
import * as constants from "./constants";

export const add = (value) => ({
  type: constants.ADD,
  payload: value
});

export const subtract = (value) => ({
  type: constants.SUBTRACT,
  payload: value
});
