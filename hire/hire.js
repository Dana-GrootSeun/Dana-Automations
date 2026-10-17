const reel = document.getElementById("reel");
const sound = document.getElementById("sound");

sound.addEventListener("click", () => {
  reel.muted = !reel.muted;
  if (!reel.muted) { reel.currentTime = 0; reel.play(); }
  sound.textContent = reel.muted ? "Tap for sound" : "Mute";
  sound.setAttribute("aria-pressed", String(!reel.muted));
});
