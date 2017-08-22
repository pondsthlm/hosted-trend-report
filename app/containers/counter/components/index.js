// For smaller containers you could put tis in parent index.
// only export what we want to be used outside container

//import addButton from "./add-button"; we dont want to expose addButton
import counter from "./counter";
import sum from "./sum";

export default { sum, counter };
