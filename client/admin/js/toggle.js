// NOTIFICATION TOGGLE
document.addEventListener("DOMContentLoaded", () => {
  const notiBell = document.getElementById("notiBell");
  const notiCount = document.getElementById("notiCount");
  const notiModal = document.getElementById("notiModal");

  function toggleNotification() {
    notiModal.classList.toggle("active");
  }

  function closeNotification(event) {
    if (
      !notiModal.contains(event.target) &&
      !notiBell.contains(event.target) &&
      !notiCount.contains(event.target)
    ) {
      notiModal.classList.remove("active");
    }
  }

  // Toggle modal when clicking bell or count
  notiBell.addEventListener("click", toggleNotification);
  notiCount.addEventListener("click", toggleNotification);

  // Close modal when clicking outside
  document.addEventListener("click", closeNotification);
});

// ADD MEMBER TOGGLE
document.addEventListener("DOMContentLoaded", () => {
  const addMemberButton = document.getElementById("addMember");
  const addMemberBox = document.querySelector(".add-member-box");
  const backdrop = document.querySelector(".add-member-dialog-backdrop");
  const closeButton = document.getElementById("close-member-button");

  // Open dialog
  addMemberButton.addEventListener("click", () => {
    backdrop.style.display = "flex";
    setTimeout(() => {
      backdrop.classList.add("active");
      setTimeout(() => {
        addMemberBox.classList.add("active");
      }, 10);
    }, 10);
  });

  // Close dialog (close button or backdrop click)
  const closeDialog = () => {
    addMemberBox.classList.remove("active");
    setTimeout(() => {
      backdrop.classList.remove("active");
      setTimeout(() => {
        backdrop.style.display = "none";
      }, 300);
    }, 300);
  };

  // Close dialog when clicking the close button
  closeButton.addEventListener("click", closeDialog);

  // Close dialog when clicking outside the form
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      closeDialog();
    }
  });
});

// ADD RENEW TOGGLE
document.addEventListener("DOMContentLoaded", () => {
  const addMemberButton = document.getElementById("addRenew");
  const addMemberBox = document.querySelector(".add-renew-box");
  const backdrop = document.querySelector(".add-renew-dialog-backdrop");
  const closeButton = document.getElementById("close-renew-button");

  // Open dialog
  addMemberButton.addEventListener("click", () => {
    backdrop.style.display = "flex";
    setTimeout(() => {
      backdrop.classList.add("active");
      setTimeout(() => {
        addMemberBox.classList.add("active");
      }, 10);
    }, 10);
  });

  // Close dialog (close button or backdrop click)
  const closeDialog = () => {
    addMemberBox.classList.remove("active");
    setTimeout(() => {
      backdrop.classList.remove("active");
      setTimeout(() => {
        backdrop.style.display = "none";
      }, 300);
    }, 300);
  };

  // Close dialog when clicking the close button
  closeButton.addEventListener("click", closeDialog);

  // Close dialog when clicking outside the form
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      closeDialog();
    }
  });
});
