// Function to check if the element is in the viewport
const checkInView = (el) => {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
};

// Intersection Observer setup
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        handleAnimationClasses(entry.target, "add");
      }
    });
  },
  { threshold: 0.2 }
);

// Function to force reflow (ensures animation triggers)
const forceReflow = () => document.body.offsetHeight;

// Function to handle adding animation classes
const handleAnimationClasses = (element, action) => {
  const animations = [
    "slide-from-top",
    "delay-slide-from-top",
    "delay-slide-from-top-1",
    "delay-slide-from-top-2",
    "slide-from-down",
    "delay-slide-from-down",
    "delay-slide-from-down-1",
    "delay-slide-from-down-2",
    "delay-slide-from-down-3",
    "delay-slide-from-down-4",
    "slide-from-left",
    "delay-slide-from-left",
    "delay-slide-from-left-1",
    "delay-slide-from-left-2",
    "delay-slide-from-left-3",
    "slide-from-right",
    "delay-slide-from-right",
    "delay-slide-from-right-1",
    "delay-slide-from-right-2",
    "delay-slide-from-right-3",
  ];

  animations.forEach((animation) => {
    if (element.classList.contains(animation)) {
      const isDelay = animation.startsWith("delay-");
      const baseAnimation = animation.replace("delay-", "");
      const startClass = `start-${baseAnimation}`;
      const delayStartClass = `start-delay-${baseAnimation}`;
      const classToAdd = isDelay ? delayStartClass : startClass;

      if (action === "add" && !element.classList.contains(classToAdd)) {
        forceReflow();
        element.classList.add(classToAdd);
      }
    }
  });
};

// Get all elements to observe
const observerElements = document.querySelectorAll(
  ".slide-from-top, .delay-slide-from-top, .delay-slide-from-top-1, .delay-slide-from-top-2, .delay-slide-from-top-3, " +
    ".slide-from-down, .delay-slide-from-down, .delay-slide-from-down-1, .delay-slide-from-down-2, .delay-slide-from-down-3, .delay-slide-from-down-4,  " +
    ".slide-from-left, .delay-slide-from-left, .delay-slide-from-left-1, .delay-slide-from-left-2, .delay-slide-from-left-3, " +
    ".slide-from-right, .delay-slide-from-right, .delay-slide-from-right-1, .delay-slide-from-right-2, .delay-slide-from-right-3"
);

observerElements.forEach((el) => {
  if (checkInView(el)) {
    handleAnimationClasses(el, "add");
  }
  observer.observe(el);
});
