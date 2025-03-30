let allMembers = [];

// Fetch members from API and display
async function fetchMembers() {
  try {
    const response = await fetch(`${baseURL}/api/members`);
    allMembers = await response.json();
    applyFilters();
  } catch (error) {
    console.error("Error fetching members:", error);
    document.getElementById("membersContainer").innerHTML =
      '<div class="loading">Error loading members. Please try again later.</div>';
  }
}

// Display members in the container
function displayMembers(members) {
  const container = document.getElementById("membersContainer");
  const template = document.getElementById("memberTemplate");
  container.innerHTML = "";

  members.forEach((member) => {
    const card = template.cloneNode(true);
    card.style.display = "block";
    card.removeAttribute("id");

    card.querySelector(
      ".member-fullname"
    ).textContent = `${member.firstName} ${member.lastName}`;
    card.querySelector(".member-email").textContent = member.email;
    card.querySelector(".member-id span").textContent = member.memberId;

    // Redirect to detail page on card click
    card.addEventListener("click", () => {
      window.location.href = `/admin/member-detail?memberId=${encodeURIComponent(
        member.memberId
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
    .getElementById("memberSearchInput")
    .value.trim()
    .toLowerCase();

  const filtered = allMembers.filter((member) => {
    const genderMatch = !gender || member.gender?.toLowerCase() === gender;
    const membershipMatch =
      !membershipType ||
      member.membershipType?.toLowerCase() === membershipType;
    const searchMatch =
      !searchTerm ||
      `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm) ||
      member.memberId.toString().includes(searchTerm);
    return genderMatch && membershipMatch && searchMatch;
  });

  displayMembers(filtered);
}

// Attach event listeners to filter and search inputs
document
  .getElementById("filterGender")
  .addEventListener("change", applyFilters);
document
  .getElementById("filterMembershipType")
  .addEventListener("change", applyFilters);
document
  .getElementById("memberSearchInput")
  .addEventListener("input", applyFilters);

// Initial fetch of member data
fetchMembers();
