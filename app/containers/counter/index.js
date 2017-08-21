// Declare what container should export.
import * as actions from "./actions";
import components from "./components";
import * as constants from "./constants";
import reducer from "./reducer";
import { getSum } from "./selsectors"

export default { actions, components, constants, reducer, getSum };
