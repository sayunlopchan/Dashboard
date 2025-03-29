document.addEventListener("DOMContentLoaded", () => {
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;

      // Close all other sections
      document
        .querySelectorAll(".accordion-content.open")
        .forEach((item) => item.classList.remove("open"));
      document
        .querySelectorAll(".accordion-header.active")
        .forEach((hdr) => hdr.classList.remove("active"));

      // Toggle the clicked section
      const isOpen = content.classList.contains("open");
      if (!isOpen) {
        content.classList.add("open");
        header.classList.add("active");
      }
    });
  });
});
