document.addEventListener("DOMContentLoaded", async () => {
  // Get the memberId from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const memberId = urlParams.get("memberId");

  if (!memberId) {
    console.error("No memberId found in URL");
    return;
  }

  // Fetch member details from the API
  async function fetchMemberDetails(id) {
    try {
      const response = await fetch(`${baseURL}/api/members/memberId/${id}`);
      if (!response.ok) throw new Error("Failed to fetch member data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching member details:", error);
      return null;
    }
  }

  // Delete member from API
  async function deleteMember(id) {
    try {
      const response = await fetch(`${baseURL}/api/members/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete member");
      return await response.json();
    } catch (error) {
      console.error("Error deleting member:", error);
      throw error;
    }
  }

  // Update UI with fetched member details
  const memberData = await fetchMemberDetails(memberId);

  if (memberData) {
    document.title = `Member Details - ${memberData.firstName} ${memberData.lastName}`;

    document.querySelector(
      ".member-name"
    ).textContent = `${memberData.firstName} ${memberData.lastName}`;
    document.querySelector(
      ".member-id"
    ).textContent = `Member ID: ${memberData.memberId}`;
    document.querySelector(".status-badge").textContent =
      memberData.membershipType || "N/A";

    // Address
    document.querySelector(
      ".div-wrapper .member-address"
    ).textContent = `Address: ${memberData.address || "N/A"}`;

    // Personal Info
    document.querySelector(".email-value").textContent = memberData.email;
    document.querySelector(".dob-value").textContent = memberData.dob
      ? new Date(memberData.dob).toLocaleDateString()
      : "N/A";
    document.querySelector(".phoneNumber-value").textContent =
      memberData.personalPhoneNumber || "N/A";

    // Emergency Contact
    document.querySelector(".name-value").textContent =
      memberData.emergencyContact?.name || "N/A";
    document.querySelector(".relationship-value").textContent =
      memberData.emergencyContact?.relationship || "N/A";
    document.querySelector(".number-value").textContent =
      memberData.emergencyContact?.phoneNumber || "N/A";

    // Membership Details
    document.querySelector(".renewal-value").textContent = memberData.renew
      ? "Active"
      : "Inactive";
    document.querySelector(".start-value").textContent =
      memberData.membershipStartDate
        ? new Date(memberData.membershipStartDate).toLocaleDateString()
        : "N/A";
    document.querySelector(".end-value").textContent =
      memberData.membershipEndDate
        ? new Date(memberData.membershipEndDate).toLocaleDateString()
        : "N/A";
  }

  // Attach event listener to Delete Member button
  document
    .getElementById("delete_member")
    .addEventListener("click", async () => {
      // Confirm deletion with the user
      const confirmDelete = confirm(
        "Are you sure you want to delete this member?"
      );
      if (!confirmDelete) return;

      try {
        await deleteMember(memberId);
        alert("Member deleted successfully.");
        // Redirect to the members listing page or any desired page
        window.location.href = "/admin/pages/members";
      } catch (error) {
        alert("Error deleting member. Please try again later.");
      }
    });
});
