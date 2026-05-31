const revealItems = document.querySelectorAll(".reveal");
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 60, 180)}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (!reduceMotion) {
  const pointer = {
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
  };

  const updatePointer = (event) => {
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
  };

  const animateBackground = () => {
    pointer.currentX += (pointer.targetX - pointer.currentX) * 0.08;
    pointer.currentY += (pointer.targetY - pointer.currentY) * 0.08;

    const xPercent = (pointer.currentX / window.innerWidth) * 100;
    const yPercent = (pointer.currentY / window.innerHeight) * 100;
    const xOffset = xPercent - 50;
    const yOffset = yPercent - 50;

    root.style.setProperty("--cursor-x", `${xPercent}%`);
    root.style.setProperty("--cursor-y", `${yPercent}%`);
    root.style.setProperty("--flow-x", xOffset.toFixed(2));
    root.style.setProperty("--flow-y", yOffset.toFixed(2));

    requestAnimationFrame(animateBackground);
  };

  window.addEventListener("pointermove", updatePointer, { passive: true });
  requestAnimationFrame(animateBackground);
}
