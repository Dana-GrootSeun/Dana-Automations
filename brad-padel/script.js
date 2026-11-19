window.BRAD_SITE_CONFIG = window.BRAD_SITE_CONFIG || {
  whatsappNumber: "27837047088"
};

const config = window.BRAD_SITE_CONFIG;
const whatsappNumber = String(config.whatsappNumber || "").replace(/\D/g, "");
const genericMessage = "Hi Brad, I'm interested in padel coaching at Lourensford. Could you help me choose a session?";

const playfulHeadings = [...document.querySelectorAll("h1, main h2:not(.sr-only)")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const playHeading = (heading) => {
  if (!heading || reduceMotion.matches || motionPaused) return;
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
    span.style.setProperty("--word-i", index);
    span.style.setProperty("--word-x", `${index % 2 === 0 ? -10 : 10}px`);
    span.style.setProperty("--word-return-x", `${index % 2 === 0 ? 2 : -2}px`);
    span.textContent = word;
    heading.append(span);
    if (index < words.length - 1) heading.append(document.createTextNode(" "));
  });

  heading.addEventListener("pointerdown", () => playHeading(heading));
});

const heroHeading = document.querySelector("h1.play-heading");
window.requestAnimationFrame(() => playHeading(heroHeading));

window.addEventListener("hashchange", () => {
  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  const heading = target?.querySelector("h2.play-heading");
  if (heading) window.setTimeout(() => playHeading(heading), 180);
});

// Visible sections alone animate. Drift and scroll rotation live on separate layers.
let motionPaused = false;
const ballScenes = [...document.querySelectorAll('.ball-field')].map(field => {
  const section = field.parentElement;
  const balls = [...field.children].map((ball, index) => {
    const skin = document.createElement('i');
    ball.append(skin);
    const direction = index % 2 ? -1 : 1;
    const drift = ball.animate([
      { transform: 'translate3d(0,0,0)' },
      { transform: `translate3d(${direction * 20}px,-18px,0)`, offset: .45 },
      { transform: `translate3d(${direction * -8}px,6px,0)`, offset: .8 },
      { transform: 'translate3d(0,0,0)' }
    ], { duration: 5600 + index * 900, iterations: Infinity, easing: 'ease-in-out' });
    drift.pause();
    return { skin, drift, direction, index };
  });
  const toggle = document.createElement('button');
  toggle.className = 'motion-toggle';
  toggle.type = 'button';
  toggle.addEventListener('click', () => { motionPaused = !motionPaused; syncMotion(); });
  section.append(toggle);
  return { section, balls, toggle, visible: false };
});

function syncMotion() {
  const stopped = motionPaused || reduceMotion.matches;
  document.documentElement.classList.toggle('motion-paused', stopped);
  ballScenes.forEach(scene => {
    scene.toggle.textContent = stopped ? 'Play motion' : 'Pause motion';
    scene.toggle.setAttribute('aria-pressed', String(stopped));
    scene.toggle.hidden = reduceMotion.matches;
    scene.balls.forEach(({ drift, skin }) => {
      if (!stopped && scene.visible && !document.hidden) drift.play();
      else drift.pause();
      if (reduceMotion.matches) skin.style.transform = 'none';
    });
  });
  if (stopped) playfulHeadings.forEach(heading => heading.querySelectorAll('.word').forEach(word => word.getAnimations().forEach(animation => animation.cancel())));
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

let scrollFrame = 0;
window.addEventListener('scroll', () => {
  if (scrollFrame || motionPaused || reduceMotion.matches) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (motionPaused || reduceMotion.matches) return;
    ballScenes.filter(scene => scene.visible).forEach(scene => scene.balls.forEach(({ skin, direction, index }) => {
      skin.style.transform = `rotate(${window.scrollY * .24 * direction + index * 35}deg)`;
    }));
  });
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
