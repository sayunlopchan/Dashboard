let allApplications = [];

// Fetch applications from API and display
async function fetchApplications() {
  try {
    const response = await fetch(`${baseURL}/api/applications`);
    allApplications = await response.json();
    applyFilters();
  } catch (error) {
    console.error("Error fetching applications:", error);
    document.getElementById("applicationsContainer").innerHTML =
      '<div class="loading">Error loading applications. Please try again later.</div>';
  }
}

// Display applications in the container
function displayApplications(applications) {
  const container = document.getElementById("applicationsContainer");
  const template = document.getElementById("applicationTemplate");
  container.innerHTML = "";

  applications.forEach((application) => {
    const card = template.cloneNode(true);
    card.style.display = "block";
    card.removeAttribute("id");

    card.querySelector(
      ".application-fullname"
    ).textContent = `${application.firstName} ${application.lastName}`;
    card.querySelector(".application-email").textContent = application.email;
    card.querySelector(".type-value").textContent = application.membershipType;

    // Attach click event to redirect to application detail page using _id
    card.addEventListener("click", () => {
      window.location.href = `/admin/pages/application-detail?applicationId=${encodeURIComponent(
        application._id
      )}`;
    });

    container.appendChild(card);
  });
}

// Combined filter function including search
function applyFilters() {
  const gender = document.getElementById("filterGender").value.toLowerCase();
  const membershipType = document
    .getElementById("filterMembershipType")
    .value.toLowerCase();
  const searchTerm = document
    .getElementById("applicationSearchInput")
    .value.trim()
    .toLowerCase();

  const filtered = allApplications.filter((application) => {
    const genderMatch = !gender || application.gender?.toLowerCase() === gender;
    const membershipMatch =
      !membershipType ||
      application.membershipType?.toLowerCase() === membershipType;
    const searchMatch =
      !searchTerm ||
      `${application.firstName} ${application.lastName}`
        .toLowerCase()
        .includes(searchTerm) ||
      application.email.toLowerCase().includes(searchTerm) ||
      application._id.toLowerCase().includes(searchTerm);
    return genderMatch && membershipMatch && searchMatch;
  });

  displayApplications(filtered);
}

// Event listeners
document
  .getElementById("filterGender")
  .addEventListener("change", applyFilters);
document
  .getElementById("filterMembershipType")
  .addEventListener("change", applyFilters);
document
  .getElementById("applicationSearchInput")
  .addEventListener("input", applyFilters);

// Initial fetch
fetchApplications();
