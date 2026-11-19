window.BRAD_SITE_CONFIG = window.BRAD_SITE_CONFIG || {
  whatsappNumber: "27837047088"
};

const config = window.BRAD_SITE_CONFIG;
const whatsappNumber = String(config.whatsappNumber || "").replace(/\D/g, "");
const genericMessage = "Hi Brad, I'm interested in padel coaching at Lourensford. Could you help me choose a session?";

const playfulHeadings = [...document.querySelectorAll("h1, main h2:not(.sr-only)")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const touchMotion = window.matchMedia("(hover: none), (pointer: coarse)");
let motionPaused = false;

const playHeading = (heading) => {
  if (!heading || reduceMotion.matches || motionPaused) return;
  if (touchMotion.matches) {
    // A light emphasis keeps text steady during a swipe.
    heading.animate([{ opacity: .88 }, { opacity: 1 }], {
      duration: 280, easing: 'ease-out'
    });
    return;
  }
  heading.querySelectorAll('.word').forEach((word, index) => {
    word.getAnimations().forEach(animation => animation.cancel());
    word.animate([
      { transform: 'translateY(12px) rotate(-3deg)', opacity: .65 },
      { transform: 'translateY(-3px) rotate(1deg)', opacity: 1, offset: .7 },
      { transform: 'none', opacity: 1 }
    ], { duration: 520, delay: index * 45, easing: 'cubic-bezier(.16,1,.3,1)' });
  });
};

playfulHeadings.forEach((heading) => {
  const label = heading.textContent.trim();
  const words = label.split(/\s+/);
  heading.classList.add("play-heading");
  heading.setAttribute("aria-label", label);
  heading.textContent = "";

  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.className = "word";
    span.setAttribute("aria-hidden", "true");
    span.textContent = word;
    heading.append(span);
    if (index < words.length - 1) heading.append(document.createTextNode(" "));
  });

  heading.addEventListener("pointerup", event => {
    if (event.pointerType === 'mouse') playHeading(heading);
  });
});

const heroHeading = document.querySelector("h1.play-heading");
window.requestAnimationFrame(() => playHeading(heroHeading));

window.addEventListener("hashchange", () => {
  if (touchMotion.matches) return;
  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  const heading = target?.querySelector("h2.play-heading");
  if (heading) window.setTimeout(() => playHeading(heading), 180);
});

// Visible sections alone animate. Drift and scroll rotation live on separate layers.
const ballScenes = [...document.querySelectorAll('.ball-field')].map(field => {
  const section = field.parentElement;
  const balls = [...field.children].map((ball, index) => {
    const skin = document.createElement('i');
    ball.append(skin);
    const direction = index % 2 ? -1 : 1;
    const drift = ball.animate([
      { transform: 'translate3d(0,0,0)' },
      { transform: `translate3d(${direction * 20}px,-16px,0)` }
    ], { duration: 2900 + index * 440, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
    drift.pause();
    const ballMotion = { skin, drift, direction, angle: index * 35 };
    skin.style.transform = `rotate(${ballMotion.angle}deg)`;
    return ballMotion;
  });
  const toggle = document.createElement('button');
  toggle.className = 'motion-toggle';
  toggle.type = 'button';
  toggle.addEventListener('click', () => { motionPaused = !motionPaused; syncMotion(); });
  section.append(toggle);
  return { section, balls, toggle, visible: false };
});

let scrollFrame = 0;
let previousScroll = Math.max(0, window.scrollY);
let pendingScroll = 0;
let previousFrame = 0;

function stopBallScroll() {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
  pendingScroll = 0;
  previousFrame = 0;
  previousScroll = Math.max(0, window.scrollY);
}

function syncMotion() {
  const stopped = motionPaused || reduceMotion.matches;
  if (stopped || document.hidden || !ballScenes.some(scene => scene.visible)) stopBallScroll();
  document.documentElement.classList.toggle('motion-paused', stopped);
  ballScenes.forEach(scene => {
    scene.toggle.textContent = stopped ? 'Play motion' : 'Pause motion';
    scene.toggle.setAttribute('aria-pressed', String(stopped));
    scene.toggle.hidden = reduceMotion.matches;
    const active = !stopped && scene.visible && !document.hidden;
    scene.balls.forEach(({ drift, skin, angle }) => {
      if (active) drift.play();
      else drift.pause();
      skin.style.willChange = active ? 'transform' : 'auto';
      skin.style.transform = reduceMotion.matches ? 'none' : `rotate(${angle}deg)`;
    });
  });
  if (stopped) playfulHeadings.forEach(heading => {
    heading.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  });
}

const sceneObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const scene = ballScenes.find(item => item.section === entry.target);
    scene.visible = entry.isIntersecting;
  });
  syncMotion();
}, { threshold: 0 });
ballScenes.forEach(scene => sceneObserver.observe(scene.section));
reduceMotion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncMotion);
syncMotion();

function easeBallRotation(now) {
  // Consume the remaining swipe distance gradually, independent of refresh rate.
  const elapsed = previousFrame ? Math.min(now - previousFrame, 48) : 16;
  previousFrame = now;
  const step = Math.abs(pendingScroll) < .25
    ? pendingScroll
    : pendingScroll * (1 - Math.exp(-elapsed / (touchMotion.matches ? 105 : 58)));
  pendingScroll -= step;
  const degreesPerPixel = touchMotion.matches ? .15 : .24;
  for (const scene of ballScenes) {
    if (!scene.visible) continue;
    for (const ball of scene.balls) {
      ball.angle += step * degreesPerPixel * ball.direction;
      ball.skin.style.transform = `rotate(${ball.angle}deg)`;
    }
  }
  scrollFrame = pendingScroll ? requestAnimationFrame(easeBallRotation) : 0;
  if (!scrollFrame) previousFrame = 0;
}

window.addEventListener('scroll', () => {
  const scroll = Math.max(0, window.scrollY);
  const delta = scroll - previousScroll;
  previousScroll = scroll;
  if (motionPaused || reduceMotion.matches || document.hidden || !delta || !ballScenes.some(scene => scene.visible)) return;
  pendingScroll += delta;
  if (!scrollFrame) scrollFrame = requestAnimationFrame(easeBallRotation);
}, { passive: true });

const headingObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (!motionPaused) playHeading(entry.target);
    headingObserver.unobserve(entry.target);
  });
}, { threshold: .65 });
playfulHeadings.filter(heading => heading !== heroHeading).forEach(heading => headingObserver.observe(heading));

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(genericMessage)}`;
  link.target = "_blank";
  link.rel = "noopener";
});

const bookingForm = document.querySelector("[data-booking-form]");
const formStatus = document.querySelector("[data-form-status]");

if (bookingForm) {
  const sessionType = bookingForm.elements.namedItem("session");
  const childAge = bookingForm.elements.namedItem("childAge");
  const ageField = childAge.closest("[data-child-age]");

  function syncChildAge() {
    const isKidsCoaching = sessionType.value === "Kids coaching";
    ageField.hidden = !isKidsCoaching;
    childAge.disabled = !isKidsCoaching;
    childAge.required = isKidsCoaching;
  }

  sessionType.addEventListener("change", syncChildAge);
  bookingForm.addEventListener("reset", () => queueMicrotask(syncChildAge));
  window.addEventListener("pageshow", syncChildAge);
  syncChildAge();
}

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedDays = [...bookingForm.querySelectorAll('input[name="days"]:checked')].map((input) => input.value);

  if (!selectedDays.length) {
    formStatus.textContent = "Please choose at least one preferred day.";
    bookingForm.querySelector("[data-day-fieldset]")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  if (!bookingForm.reportValidity()) return;
  const data = new FormData(bookingForm);
  const childAge = String(data.get("childAge") || "").trim();
  const request = [
    "Hi Brad, I'd like to enquire about a padel coaching session.",
    "",
    `Name: ${data.get("name")}`,
    `Preferred days: ${selectedDays.join(", ")}`,
    `Preferred time of day: ${data.get("timeOfDay")}`,
    `Session: ${data.get("session")}`,
    ...(childAge ? [`Child's age: ${childAge}`] : []),
    `Playing level: ${data.get("level")}`,
    `Focus: ${data.get("focus") || "Not supplied"}`,
    "Venue: Virgin Active Padel Club Lourensford",
    "",
    "Please let me know which session time could work."
  ].join("\n");

  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(request)}`, "_blank", "noopener");
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
