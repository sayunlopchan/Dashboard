// CARD HOVER EFFECT
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    // Add hover-active class on mouseenter
    card.addEventListener("mouseenter", () => {
      card.classList.add("hover-active");
    });

    // Remove hover-active class after animation completes
    card.addEventListener("animationend", (event) => {
      if (event.animationName === "rotatebg") {
        card.classList.remove("hover-active");
      }
    });
  });
});
