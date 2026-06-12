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

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (!reduceMotion) {
  // Parallax depth (existing) + the eased pixel position powering the
  // ambient glow, the custom cursor, and the headline "ink" reveal.
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  // Raw pointer pixel position and its smoothed counterparts.
  let pointerPxX = window.innerWidth / 2;
  let pointerPxY = window.innerHeight / 2;
  let glowX = pointerPxX;
  let glowY = pointerPxY;
  let ringX = pointerPxX;
  let ringY = pointerPxY;

  const titleLines = Array.from(document.querySelectorAll(".title-line"));
  let titleRects = [];
  const measureTitle = () => {
    titleRects = titleLines.map((el) => el.getBoundingClientRect());
  };
  measureTitle();
  // Re-measure once the reveal transform has settled, then on layout changes.
  setTimeout(measureTitle, 1300);
  window.addEventListener("resize", measureTitle, { passive: true });
  window.addEventListener("scroll", measureTitle, { passive: true });

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerPxX = event.clientX;
      pointerPxY = event.clientY;
      targetX = (event.clientX / window.innerWidth - 0.5) * 20;
      targetY = (event.clientY / window.innerHeight - 0.5) * 20;
      document.body.classList.add("cursor-active");
    },
    { passive: true }
  );

  // Fade everything out when the pointer leaves the window.
  document.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-active");
  });
  document.addEventListener("mouseenter", () => {
    document.body.classList.add("cursor-active");
  });

  // Cursor swells when hovering anything clickable.
  if (finePointer) {
    document.body.classList.add("cursor-ready");
    const hot = "a, button, [role='button']";
    document.addEventListener("pointerover", (event) => {
      if (event.target.closest(hot)) document.body.classList.add("cursor-hot");
    });
    document.addEventListener("pointerout", (event) => {
      if (event.target.closest(hot)) document.body.classList.remove("cursor-hot");
    });
    // Quick tactile pulse on click.
    document.addEventListener("pointerdown", () => {
      document.body.classList.add("cursor-down");
    });
    document.addEventListener("pointerup", () => {
      document.body.classList.remove("cursor-down");
    });
  }

  const render = () => {
    // Parallax (portrait + project card).
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;
    root.style.setProperty("--pointer-x", currentX.toFixed(2));
    root.style.setProperty("--pointer-y", currentY.toFixed(2));

    // Ambient glow lags softly behind the pointer.
    glowX += (pointerPxX - glowX) * 0.12;
    glowY += (pointerPxY - glowY) * 0.12;
    root.style.setProperty("--mx", `${glowX.toFixed(1)}px`);
    root.style.setProperty("--my", `${glowY.toFixed(1)}px`);

    // Custom cursor: dot snaps to the pointer, ring trails it.
    root.style.setProperty("--dx", `${pointerPxX.toFixed(1)}px`);
    root.style.setProperty("--dy", `${pointerPxY.toFixed(1)}px`);
    ringX += (pointerPxX - ringX) * 0.2;
    ringY += (pointerPxY - ringY) * 0.2;
    root.style.setProperty("--rx", `${ringX.toFixed(1)}px`);
    root.style.setProperty("--ry", `${ringY.toFixed(1)}px`);

    // Headline ink: position the accent gradient relative to each line.
    titleLines.forEach((el, i) => {
      const rect = titleRects[i];
      if (!rect) return;
      el.style.setProperty("--tmx", `${(glowX - rect.left).toFixed(1)}px`);
      el.style.setProperty("--tmy", `${(glowY - rect.top).toFixed(1)}px`);
    });

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}
