const reel = document.getElementById("reel");
const sound = document.getElementById("sound");
const films = [...document.querySelectorAll(".film video")];

function show() {
  sound.textContent = reel.muted ? "Tap for sound" : "Mute";
  sound.setAttribute("aria-pressed", String(!reel.muted));
  sound.classList.toggle("pulse", reel.muted);
}

// Only one video makes sound at a time: the showreel's sound pauses the films,
// and playing a film mutes the showreel (it keeps playing silently) and pauses the other films.
function unmute() {
  films.forEach((f) => f.pause());
  reel.muted = false;
  reel.currentTime = 0;
  reel.play().catch(() => { reel.muted = true; reel.play(); show(); });
  show();
}

// Browsers (all iPhones included) only allow sound after the visitor taps the page.
// So: try to start with sound; if that's blocked, play muted and turn the sound
// on at the first tap on the page. "click", not "pointerdown": a touch pointerdown
// doesn't count as a tap (and fires when scrolling), so unmuting there gets blocked.
reel.muted = false;
reel.play().then(show).catch(() => {
  reel.muted = true;
  reel.play();
  show();
  const firstTap = (event) => {
    if (event.target.closest("a, button, video")) return; // links, buttons and the films handle themselves
    document.removeEventListener("click", firstTap);
    if (reel.muted && films.every((f) => f.paused)) unmute(); // don't interrupt someone watching a film
  };
  document.addEventListener("click", firstTap);
});

films.forEach((film) => film.addEventListener("play", () => {
  films.forEach((f) => { if (f !== film) f.pause(); });
  if (!reel.muted) { reel.muted = true; show(); }
}));

sound.addEventListener("click", () => {
  if (reel.muted) unmute();
  else { reel.muted = true; show(); }
});
