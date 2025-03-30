document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("hover-active");
    });
  });
});
