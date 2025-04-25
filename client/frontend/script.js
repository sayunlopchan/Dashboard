// BASE URL
const baseURL = "http://localhost:5000";
// const baseURL = "https://dashboard-xfpn.onrender.com";

// LAODING
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  loading.style.display = "none";
});

// STICKY HEADER
document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const main = document.querySelector("main");

  // Function to update the sticky class
  function updateHeader() {
    if (window.scrollY > 20) {
      header.classList.add("sticky");
      main.style.marginTop = "90px";
      localStorage.setItem("isSticky", "true"); // Save state
    } else {
      header.classList.remove("sticky");
      main.style.marginTop = "0";
      localStorage.setItem("isSticky", "false"); // Save state
    }
  }

  // Check localStorage on page load
  window.addEventListener("load", () => {
    if (localStorage.getItem("isSticky") === "true") {
      header.classList.add("sticky");
      main.style.marginTop = "90px";
    }
  });

  // Listen for scroll event
  window.addEventListener("scroll", updateHeader);
});

// Login signup form
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginSection");
  const signupForm = document.getElementById("signupSection");

  // Login Form Submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors(loginForm);

    const email = loginForm.querySelector("#login-email").value.trim();
    const password = loginForm.querySelector("#login-password").value.trim();
    let isValid = true;

    if (!validateEmail(email)) {
      showError(
        loginForm.querySelector("#login-email"),
        "Please enter a valid email address"
      );
      isValid = false;
    }

    if (password.length < 6) {
      showError(
        loginForm.querySelector("#login-password"),
        "Password must be at least 6 characters"
      );
      isValid = false;
    }

    if (isValid) {
      try {
        const response = await fetch(`${baseURL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include", // Send cookies
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // On successful login, backend sets cookie and we redirect to dashboard
        window.location.href = `${baseURL}/admin/dashboard`;
      } catch (err) {
        console.error("Login error:", err);
        showError(loginForm.querySelector("#login-password"), err.message);
      }
    }
  });

  // Signup Form Submission
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors(signupForm);

    const username = signupForm.querySelector("#signup-username").value.trim();
    const email = signupForm.querySelector("#signup-email").value.trim();
    const password = signupForm.querySelector("#signup-password").value.trim();
    const confirmPassword = signupForm
      .querySelector("#signup-confirm-password")
      .value.trim();
    let isValid = true;

    // Validation
    if (username.length < 3) {
      showError(
        signupForm.querySelector("#signup-username"),
        "Username must be at least 3 characters"
      );
      isValid = false;
    }

    if (!validateEmail(email)) {
      showError(
        signupForm.querySelector("#signup-email"),
        "Please enter a valid email address"
      );
      isValid = false;
    }

    if (password.length < 6) {
      showError(
        signupForm.querySelector("#signup-password"),
        "Password must be at least 6 characters"
      );
      isValid = false;
    }

    if (password !== confirmPassword) {
      showError(
        signupForm.querySelector("#signup-confirm-password"),
        "Passwords do not match"
      );
      isValid = false;
    }

    if (isValid) {
      try {
        const response = await fetch(`${baseURL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
          credentials: "include", // Important for cookies
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Signup failed");
        }

        // On successful signup, redirect to dashboard
        window.location.href = "/admin/dashboard";
      } catch (err) {
        console.error("Signup error:", err);
        showError(signupForm.querySelector("#signup-email"), err.message);
      }
    }
  });

  // Helper Functions
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(inputElement, message) {
    const errorSpan =
      inputElement.parentElement.querySelector(".error-message");
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.color = "#ff4444";
      errorSpan.style.fontSize = "0.8rem";
    }
  }

  function clearErrors(form) {
    const errorMessages = form.querySelectorAll(".error-message");
    if (errorMessages) {
      errorMessages.forEach((span) => (span.textContent = ""));
    }
  }
});

// Toggle Between Login and Signup Forms
document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const signupSection = document.getElementById("signupSection");
  const toggleSignup = document.getElementById("toggle-signup");
  const toggleLogin = document.getElementById("toggle-login");

  toggleSignup.addEventListener("click", function () {
    loginSection.style.display = "none";
    signupSection.style.display = "block";
  });

  toggleLogin.addEventListener("click", function () {
    signupSection.style.display = "none";
    loginSection.style.display = "block";
  });
});

// MENU TOGGLE SIDE
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleSlideMenu");
  const closeButton = document.getElementById("closeSlideMenu");
  const dialogBackdrop = document.querySelector(".menu-backdrop");
  const slideMenu = document.querySelector(".slide-in-menu");

  // Function to open the slide menu and show the backdrop
  function openSlide() {
    dialogBackdrop.classList.add("active");
    slideMenu.classList.add("open");
  }

  // Function to close the slide menu and hide the backdrop
  function closeSlide() {
    dialogBackdrop.classList.remove("active");
    slideMenu.classList.remove("open");
  }

  // Add event listener for the hamburger menu button
  if (toggleButton) {
    toggleButton.addEventListener("click", openSlide);
  }

  // Add event listener for the close button
  if (closeButton) {
    closeButton.addEventListener("click", closeSlide);
  }

  // Add event listener for the backdrop to close the menu when clicked
  if (dialogBackdrop) {
    dialogBackdrop.addEventListener("click", closeSlide);
  }
});

// ADD CLASS TO ACTIVE NAV
document.addEventListener("DOMContentLoaded", () => {
  const activePage = window.location.pathname;
  const navLinks = document.querySelectorAll("nav ul li a");

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === activePage) {
      link.classList.add("active");
    }
  });
});
