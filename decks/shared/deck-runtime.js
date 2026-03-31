const slides = Array.from(document.querySelectorAll(".slide"));
const progressNav = document.getElementById("progress-nav");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeIndex = 0;
let scrollTicking = false;

function getClosestSlideIndex() {
  const viewportCenter = window.scrollY + window.innerHeight / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    const slideCenter = slide.offsetTop + slide.offsetHeight / 2;
    const distance = Math.abs(slideCenter - viewportCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function scrollToSlide(index) {
  const boundedIndex = Math.max(0, Math.min(slides.length - 1, index));
  const target = slides[boundedIndex];
  const targetY = target.offsetTop - (window.innerHeight - target.offsetHeight) / 2;

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

function updateActive(index) {
  activeIndex = index;
  Array.from(progressNav.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === index);
    if (dotIndex === index) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
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

window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    updateActive(getClosestSlideIndex());
    scrollTicking = false;
  });
});

setTimeout(() => {
  if (slides[0]) {
    slides[0].classList.add("is-visible");
    updateActive(getClosestSlideIndex());
  }
}, 100);

document.getElementById("prev-slide").addEventListener("click", () => scrollToSlide(activeIndex - 1));
document.getElementById("next-slide").addEventListener("click", () => scrollToSlide(activeIndex + 1));

window.addEventListener("keydown", (event) => {
  if (event.target && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
    return;
  }
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
