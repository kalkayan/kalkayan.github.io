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
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

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

  document.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-active");
  });
  document.addEventListener("mouseenter", () => {
    document.body.classList.add("cursor-active");
  });

  if (finePointer) {
    document.body.classList.add("cursor-ready");
    const hot = "a, button, [role='button']";
    document.addEventListener("pointerover", (event) => {
      if (event.target.closest(hot)) document.body.classList.add("cursor-hot");
    });
    document.addEventListener("pointerout", (event) => {
      if (event.target.closest(hot)) document.body.classList.remove("cursor-hot");
    });
    document.addEventListener("pointerdown", () => {
      document.body.classList.add("cursor-down");
    });
    document.addEventListener("pointerup", () => {
      document.body.classList.remove("cursor-down");
    });
  }

  // Hero copy: CSS 3D perspective tilt following the cursor.
  // Applied to .hero-copy (no reveal class) so it doesn't fight the
  // reveal transitions on its children.
  const heroCopy = document.querySelector(".hero-copy");
  let tiltX = 0;
  let tiltY = 0;

  const render = () => {
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;
    root.style.setProperty("--pointer-x", currentX.toFixed(2));
    root.style.setProperty("--pointer-y", currentY.toFixed(2));

    glowX += (pointerPxX - glowX) * 0.12;
    glowY += (pointerPxY - glowY) * 0.12;
    root.style.setProperty("--mx", `${glowX.toFixed(1)}px`);
    root.style.setProperty("--my", `${glowY.toFixed(1)}px`);

    root.style.setProperty("--dx", `${pointerPxX.toFixed(1)}px`);
    root.style.setProperty("--dy", `${pointerPxY.toFixed(1)}px`);
    ringX += (pointerPxX - ringX) * 0.2;
    ringY += (pointerPxY - ringY) * 0.2;
    root.style.setProperty("--rx", `${ringX.toFixed(1)}px`);
    root.style.setProperty("--ry", `${ringY.toFixed(1)}px`);

    titleLines.forEach((el, i) => {
      const rect = titleRects[i];
      if (!rect) return;
      el.style.setProperty("--tmx", `${(glowX - rect.left).toFixed(1)}px`);
      el.style.setProperty("--tmy", `${(glowY - rect.top).toFixed(1)}px`);
    });

    // 3-D perspective tilt: the hero copy block tilts like a card toward the cursor.
    if (heroCopy) {
      tiltX += ((currentX / 10) * 3.0 - tiltX) * 0.08;
      tiltY += ((currentY / 10) * 2.0 - tiltY) * 0.08;
      heroCopy.style.transform =
        `perspective(1400px) rotateY(${tiltX.toFixed(3)}deg) rotateX(${(-tiltY).toFixed(3)}deg)`;
    }

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}
