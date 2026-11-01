const reel = document.getElementById("reel");
const sound = document.getElementById("sound");
const opti = document.querySelector(".film video");

function show() {
  sound.textContent = reel.muted ? "Tap for sound" : "Mute";
  sound.setAttribute("aria-pressed", String(!reel.muted));
  sound.classList.toggle("pulse", reel.muted);
}

// Only one video makes sound at a time: the showreel's sound pauses the Opti film,
// and playing the Opti film mutes the showreel (it keeps playing silently).
function unmute() {
  opti.pause();
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
    if (event.target.closest("a, button, video")) return; // links, buttons and the Opti film handle themselves
    document.removeEventListener("click", firstTap);
    if (reel.muted && opti.paused) unmute(); // don't interrupt someone watching the Opti film
  };
  document.addEventListener("click", firstTap);
});

opti.addEventListener("play", () => {
  if (!reel.muted) { reel.muted = true; show(); }
});

sound.addEventListener("click", () => {
  if (reel.muted) unmute();
  else { reel.muted = true; show(); }
});
