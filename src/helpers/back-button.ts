// "← Back" for extension pages: only shown when there is somewhere to go back to
// (e.g. blocked page → history), since pages opened from the toolbar start a fresh tab history.
export const setupBackButton = (button: HTMLButtonElement) => {
  button.hidden = window.history.length <= 1;
  button.addEventListener("click", () => {
    window.history.back();
  });
};
