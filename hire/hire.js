const reel = document.getElementById("reel");
const sound = document.getElementById("sound");
const films = [...document.querySelectorAll(".film video")];
let touched = false; // the pulse only invites the first tap

function show() {
  sound.textContent = !reel.muted ? "Mute" : reel.paused ? "Play" : "Tap for sound";
  sound.setAttribute("aria-pressed", String(!reel.muted));
  sound.classList.toggle("pulse", reel.muted && !touched);
}

// Only one video makes sound at a time: the showreel's sound pauses the films,
// and playing a film mutes the showreel (it keeps playing silently) and pauses the other films.
function unmute() {
  films.forEach((f) => f.pause());
  reel.muted = false;
  reel.play().catch(() => { reel.muted = true; show(); });
  show();
}

// Sound only ever comes from the button. The reel starts muted (browsers allow that),
// except for visitors who asked for reduced motion; they get a "Play" button instead.
// Low Power Mode on iPhone blocks even muted autoplay, so a failed play also shows "Play".
reel.addEventListener("play", show);
reel.addEventListener("pause", show);
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) reel.play().catch(show);
show();

films.forEach((film) => film.addEventListener("play", () => {
  films.forEach((f) => { if (f !== film) f.pause(); });
  if (!reel.muted) { reel.muted = true; show(); }
}));

sound.addEventListener("click", () => {
  touched = true;
  if (reel.muted) unmute();
  else { reel.muted = true; show(); }
});
