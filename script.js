const root = document.documentElement;
const revealItems = document.querySelectorAll(".reveal");
const localTime = document.querySelector("#local-time");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 85, 510)}ms`;
  requestAnimationFrame(() => item.classList.add("is-visible"));
});

const updateLocalTime = () => {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

  localTime.textContent = `Dublin ${time}`;
};

updateLocalTime();
setInterval(updateLocalTime, 30_000);

if (!reduceMotion) {
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 20;
      targetY = (event.clientY / window.innerHeight - 0.5) * 20;
    },
    { passive: true }
  );

  const renderPointerDepth = () => {
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;
    root.style.setProperty("--pointer-x", currentX.toFixed(2));
    root.style.setProperty("--pointer-y", currentY.toFixed(2));
    requestAnimationFrame(renderPointerDepth);
  };

  requestAnimationFrame(renderPointerDepth);
}
