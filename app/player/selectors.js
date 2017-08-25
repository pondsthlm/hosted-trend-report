// When other containers need to share state or calculated data.
import { constants } from "./";

function getSum(state) {
  return state[NAME].sum;
}

export default { getSum };
