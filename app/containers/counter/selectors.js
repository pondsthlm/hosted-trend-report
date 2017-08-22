// When other containers need to share state or calculated data.
import { NAME } from "./constants";

function getSum(state) {
  return state[NAME].sum;
}

export default { getSum };
