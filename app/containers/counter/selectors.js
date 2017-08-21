// When other containers need to share state or calculated data.
import { NAME } from "./constants";

export default { getSum: (state) => {
  return state[NAME].sum
}};
