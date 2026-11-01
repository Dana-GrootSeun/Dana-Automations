const reel = document.getElementById("reel");
const sound = document.getElementById("sound");

function show() {
  sound.textContent = reel.muted ? "Tap for sound" : "Mute";
  sound.setAttribute("aria-pressed", String(!reel.muted));
  sound.classList.toggle("pulse", reel.muted);
}

function unmute() {
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
    if (event.target.closest("a, button")) return; // links and the sound button handle themselves
    document.removeEventListener("click", firstTap);
    if (reel.muted) unmute();
  };
  document.addEventListener("click", firstTap);
});

sound.addEventListener("click", () => {
  if (reel.muted) unmute();
  else { reel.muted = true; show(); }
});
