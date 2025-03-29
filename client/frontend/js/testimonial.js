// TESTIMONIALS
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("testimonialSlider");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let isAnimating = false;

  function moveSlide(direction) {
    if (isAnimating) return; // Prevent spamming
    isAnimating = true;

    if (direction === "next") {
      // Move the first card to the end after sliding
      slider.style.transition = "transform 0.5s ease-in-out";
      slider.style.transform = `translateX(-100%)`;

      slider.addEventListener(
        "transitionend",
        () => {
          slider.appendChild(slider.firstElementChild); // Move first card to the end
          slider.style.transition = "none"; // Disable transition for instant reset
          slider.style.transform = "translateX(0)"; // Reset position
          setTimeout(() => {
            slider.style.transition = "transform 0.5s ease-in-out"; // Re-enable transition
          }, 10); // Small delay to ensure reset
          isAnimating = false;
        },
        { once: true }
      );
    } else if (direction === "prev") {
      // Move the last card to the beginning before sliding
      slider.style.transition = "none"; // Disable transition for instant reset
      slider.insertBefore(slider.lastElementChild, slider.firstElementChild); // Move last card to the beginning
      slider.style.transform = "translateX(-100%)"; // Set initial position

      setTimeout(() => {
        slider.style.transition = "transform 0.5s ease-in-out"; // Re-enable transition
        slider.style.transform = "translateX(0)"; // Slide back to the start
      }, 10); // Small delay to ensure reset

      slider.addEventListener(
        "transitionend",
        () => {
          isAnimating = false;
        },
        { once: true }
      );
    }
  }

  // Event listeners for buttons
  prevBtn.addEventListener("click", () => moveSlide("prev"));
  nextBtn.addEventListener("click", () => moveSlide("next"));

  // parallex

  const container = document.querySelector(".testimonial-parallex");
  const circle1 = document.querySelector(".parallext-circle1");
  const circle2 = document.querySelector(".parallext-circle2");
  const circle3 = document.querySelector(".parallext-circle3");

  container.addEventListener("mousemove", (e) => {
    const { left, top, width, height } = container.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;

    // Adjust movement for circles
    circle1.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    circle2.style.transform = `translate(${x * -0.1}px, ${y * -0.1}px)`;
    circle3.style.transform = `translate(${x * -0.1}px, ${y * -0.1}px)`;
  });

  container.addEventListener("mouseleave", () => {
    circle1.style.transform = "translate(0, 0)";
    circle2.style.transform = "translate(0, 0)";
    circle3.style.transform = "translate(0, 0)";
  });
});
