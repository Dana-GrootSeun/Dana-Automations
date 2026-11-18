document.documentElement.classList.add("m-enter", "mo-js");

window.setTimeout(() => {
  document.documentElement.classList.add("m-enter-done");
}, 700);

window.setTimeout(() => {
  document.documentElement.classList.add("mo-safe");
}, 2500);
