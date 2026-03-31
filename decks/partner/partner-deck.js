const slides = Array.from(document.querySelectorAll(".slide"));
const progressNav = document.getElementById("progress-nav");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeIndex = 0;

function scrollToSlide(index) {
  const boundedIndex = Math.max(0, Math.min(slides.length - 1, index));
  slides[boundedIndex].scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "center",
  });
}

function updateActive(index) {
  activeIndex = index;
  Array.from(progressNav.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === index);
    dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
  });

  slides.forEach((slide, slideIndex) => {
    if (slideIndex === index) {
      slide.classList.add("is-visible");
    }
  });
}

slides.forEach((slide, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "progress-dot";
  dot.setAttribute("aria-label", `Go to slide ${index + 1}: ${slide.dataset.title}`);
  dot.title = `${index + 1}. ${slide.dataset.title}`;
  dot.addEventListener("click", () => scrollToSlide(index));
  progressNav.appendChild(dot);
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    updateActive(slides.indexOf(visible.target));
  },
  { threshold: [0.45, 0.65, 0.85] }
);

slides.forEach((slide) => observer.observe(slide));

setTimeout(() => {
  if (slides[0]) slides[0].classList.add("is-visible");
}, 100);

document.getElementById("prev-slide").addEventListener("click", () => scrollToSlide(activeIndex - 1));
document.getElementById("next-slide").addEventListener("click", () => scrollToSlide(activeIndex + 1));

window.addEventListener("keydown", (event) => {
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    scrollToSlide(activeIndex + 1);
  }
  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    scrollToSlide(activeIndex - 1);
  }
});

lucide.createIcons();
