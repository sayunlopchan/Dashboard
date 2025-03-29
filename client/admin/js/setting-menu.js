// setting menu
document.addEventListener("DOMContentLoaded", () => {
  const settingsMenu = document.querySelector(".settings-menu");
  const gearIcon = settingsMenu.querySelector(".fa-gear");

  // Helper function to update the gear icon's rotation
  function updateGearRotation() {
    if (settingsMenu.classList.contains("active")) {
      gearIcon.style.transform = "rotate(45deg)";
    } else {
      gearIcon.style.transform = "rotate(0deg)";
    }
  }

  settingsMenu.addEventListener("click", function (e) {
    e.stopPropagation();
    this.classList.toggle("active");
    updateGearRotation();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".settings-menu")) {
      settingsMenu.classList.remove("active");
      updateGearRotation();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      settingsMenu.classList.remove("active");
      updateGearRotation();
    }
  });
});

// Unauthorized dialog box
document.addEventListener("DOMContentLoaded", () => {
  // Show the unauthorized dialog
  const authDialog = () => {
    const dialogBox = document.querySelector(".unauthorized-dialog-box");
    const dialogBackdrop = document.querySelector(
      ".unauthorized-dialog-backdrop"
    );

    if (dialogBox && dialogBackdrop) {
      dialogBackdrop.style.display = "flex"; // Show backdrop
      setTimeout(() => {
        dialogBackdrop.classList.add("active"); // Fade in backdrop
        setTimeout(() => {
          dialogBox.classList.add("active"); // Scale in dialog box
        }, 10); // Small delay for smooth transition
      }, 10);

      // Add event listener for Esc key
      document.addEventListener("keydown", handleEscKey);
    }
  };

  // Close the unauthorized dialog
  const closeDialog = () => {
    const dialogBox = document.querySelector(".unauthorized-dialog-box");
    const dialogBackdrop = document.querySelector(
      ".unauthorized-dialog-backdrop"
    );

    if (dialogBox && dialogBackdrop) {
      dialogBox.classList.remove("active"); // Scale out dialog box
      setTimeout(() => {
        dialogBackdrop.classList.remove("active"); // Fade out backdrop
        setTimeout(() => {
          dialogBackdrop.style.display = "none"; // Hide backdrop
        }, 300); // Wait for backdrop fade-out transition
      }, 300); // Wait for dialog box scale-out transition

      // Remove Esc key listener
      document.removeEventListener("keydown", handleEscKey);
    }
  };

  // Handle Esc key press for unauthorized dialog
  const handleEscKey = (event) => {
    if (event.key === "Escape") {
      closeDialog();
    }
  };

  // Handle protected content click (dashboard, members,applications etc.)
  async function handleProtectedClick(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth/verify-token", {
        method: "GET",
        credentials: "include",
      });
      const text = await response.text();
      const data = JSON.parse(text);

      if (!data.valid) {
        authDialog();
        return false;
      }
      // If valid, navigate based on the element's ID
      const target = event.target.id;
      if (target === "dashboard-li") {
        window.location.href = "/admin/dashboard";
      }
    } catch (error) {
      console.error("Auth check failed in protected click:", error);
      authDialog();
      return false;
    }
  }

  // Attach event listeners for protected links
  const dashboardLink = document.getElementById("dashboard-li");

  if (dashboardLink)
    dashboardLink.addEventListener("click", handleProtectedClick);

  // Close the unauthorized dialog when the close button is clicked
  const closeButton = document.getElementById("closeDialogBtn");
  if (closeButton) {
    closeButton.addEventListener("click", closeDialog);
  }

  // Also close the dialog when clicking on the backdrop itself
  const dialogBackdrop = document.querySelector(
    ".unauthorized-dialog-backdrop"
  );
  if (dialogBackdrop) {
    dialogBackdrop.addEventListener("click", (e) => {
      if (e.target === dialogBackdrop) {
        closeDialog();
      }
    });
  }
});

// PAGE toggle
document.addEventListener("DOMContentLoaded", () => {
  // Function to handle redirection after verifying auth status
  async function redirectToPage(page) {
    try {
      const response = await fetch("/api/auth/verify-token", {
        method: "GET",
        credentials: "include",
      });
      const text = await response.text();
      const data = JSON.parse(text);

      // Only redirect if the token is valid
      if (data.valid) {
        const basePath = "/admin/";
        window.location.href = `${basePath}${page}`;
      } else {
        // Optionally, show an unauthorized message or dialog here
        console.warn("User not authenticated");
      }
    } catch (error) {
      console.error("Error during page redirection:", error);
    }
  }

  // Attach event listeners to each <li> element
  const dashboardLink = document.getElementById("dashboard-li");
  const memberLink = document.getElementById("member-li");
  const applicationLink = document.getElementById("application-li");

  if (dashboardLink) {
    dashboardLink.addEventListener("click", () => {
      redirectToPage("dashboard");
    });
  }
  if (memberLink) {
    memberLink.addEventListener("click", () => {
      redirectToPage("members");
    });
  }
  if (applicationLink) {
    applicationLink.addEventListener("click", () => {
      redirectToPage("Applications");
    });
  }
});

// login/logout ui
document.addEventListener("DOMContentLoaded", () => {
  // Elements for login/logout functionality
  const authButton = document.getElementById("auth-button");

  // Elements for login dialog (if you use one)
  const signinSignupDialog = document.querySelector(
    ".signin-signup-dialog-box"
  );
  const loginDialogBackdrop = document.querySelector(
    ".signin-signup-dialog-backdrop"
  );

  // Elements for logout confirmation dialog
  const logoutDialog = document.querySelector(".logout-confirm-dialog-box");
  const logoutBackdrop = document.querySelector(
    ".confirmation-dialog-backdrop"
  );

  // Elements for unauthorized dialog (if needed)
  const unauthorizedBackdrop = document.querySelector(
    ".unauthorized-dialog-backdrop"
  );
  const closeUnauthorizedBtn = document.getElementById("closeDialogBtn");

  // Check auth status via /api/auth/verify-token endpoint
  async function checkAuthStatus() {
    try {
      const response = await fetch("/api/auth/verify-token", {
        method: "GET",
        credentials: "include",
      });
      // Log the raw response to debug unexpected responses
      const text = await response.text();
      console.log("Raw response from /api/auth/verify-token:", text);
      const data = JSON.parse(text);

      if (data.valid) {
        authButton.textContent = "Logout";
        authButton.onclick = showLogoutDialog;
      } else {
        authButton.textContent = "Login";
        authButton.onclick = showLoginDialog;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      authButton.textContent = "Login";
      authButton.onclick = showLoginDialog;
    }
  }

  // Show login dialog
  function showLoginDialog() {
    if (signinSignupDialog && loginDialogBackdrop) {
      signinSignupDialog.style.display = "block";
      loginDialogBackdrop.style.display = "block";
      setTimeout(() => {
        signinSignupDialog.classList.add("active");
        loginDialogBackdrop.classList.add("active");
      }, 10);
    }
  }

  // Hide login dialog
  function hideLoginDialog() {
    if (signinSignupDialog && loginDialogBackdrop) {
      signinSignupDialog.classList.remove("active");
      loginDialogBackdrop.classList.remove("active");
      setTimeout(() => {
        signinSignupDialog.style.display = "none";
        loginDialogBackdrop.style.display = "none";
      }, 300);
    }
  }

  // Show logout confirmation dialog
  function showLogoutDialog() {
    if (logoutDialog && logoutBackdrop) {
      logoutBackdrop.style.display = "flex";
      setTimeout(() => {
        logoutDialog.classList.add("active");
        logoutBackdrop.classList.add("active");
      }, 10);
    }
  }

  // Hide logout confirmation dialog
  function hideLogoutDialog() {
    if (logoutDialog && logoutBackdrop) {
      logoutDialog.classList.remove("active");
      logoutBackdrop.classList.remove("active");
      setTimeout(() => {
        logoutBackdrop.style.display = "none";
      }, 300);
    }
  }

  // Handle logout by calling the server endpoint
  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        authButton.textContent = "Login";
        authButton.onclick = showLoginDialog;
        hideLogoutDialog();
        window.location.href = "/"; // Redirect to home after logout
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // Event listener for unauthorized dialog close button (if used)
  if (closeUnauthorizedBtn && unauthorizedBackdrop) {
    closeUnauthorizedBtn.addEventListener("click", () => {
      unauthorizedBackdrop.style.display = "none";
    });
  }

  // Optionally, hide the login dialog if clicking outside it
  document.addEventListener("click", (e) => {
    if (
      signinSignupDialog &&
      !e.target.closest(".signin-signup-dialog-box") &&
      !e.target.closest("#auth-button")
    ) {
      hideLoginDialog();
    }
  });

  // Close the login dialog on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideLoginDialog();
    }
  });

  // Attach event listeners for logout confirmation buttons
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener("click", handleLogout);
  }
  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener("click", hideLogoutDialog);
  }

  // Initial check of authentication status on page load
  checkAuthStatus();
});
