document.addEventListener("DOMContentLoaded", () => {
  const videoBtn = document.querySelector(".content-btn");
  const videoBackdrop = document.querySelector(".video-dialog-backdrop");
  const videoDialog = document.querySelector(".video-dialog-box");
  const closeBtn = document.querySelector(".close-btn");

  // Open video dialog
  videoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    videoBackdrop.style.display = "flex";
    setTimeout(() => {
      videoBackdrop.classList.add("active");
      setTimeout(() => {
        videoDialog.classList.add("active");
      }, 10);
    }, 10);
    document.body.style.overflow = "hidden";
  });

  // Close video dialog
  const closeVideo = () => {
    videoDialog.classList.remove("active");
    setTimeout(() => {
      videoBackdrop.classList.remove("active");
      setTimeout(() => {
        videoBackdrop.style.display = "none";
      }, 300);
    }, 300);
    document.body.style.overflow = "";

    // Reset video source to stop playback
    const iframe = document.querySelector(".video-iframe");
    if (iframe) iframe.src = iframe.src;
  };

  // Close handlers
  closeBtn.addEventListener("click", closeVideo);
  videoBackdrop.addEventListener("click", (e) => {
    if (e.target === videoBackdrop) closeVideo();
  });

  // Close with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVideo();
  });
});
