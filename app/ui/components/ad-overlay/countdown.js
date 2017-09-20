
import { div } from "../../../helpers/make-element";

const className = "countdown";

function calculateRemainingTime(state) {
  return state.adDuration - state.adCurrentTime;
}

function countdownDOM(state) {
  const timeLeft = calculateRemainingTime(state);
  return div(
    {
      className,
    },
    `${timeLeft}s kvar`
  );
}

function countdown(state, dispatch) {
  const dom = countdownDOM(state, dispatch);

  dom.update((newState) => {
    const timeLeft = calculateRemainingTime(newState);
    return { replaceString: `${timeLeft}s kvar` };
  });

  return dom;
}

export default countdown;
