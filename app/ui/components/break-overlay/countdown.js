import transpileJSX from "../../helpers/transpile-jsx";

const name = "countdown";

function calculateRemainingTime(state) {
  return state.adDuration - state.adCurrentTime;
}

function countdown(state, dispatch, parentClassName) {
  const bemParent = parentClassName ? `${parentClassName}__` : "";
  const timeLeft = calculateRemainingTime(state);

  return (
    <div className={`${bemParent}${name}`}>
      {`${timeLeft}s kvar`}
    </div>
  );
}

export default countdown;
