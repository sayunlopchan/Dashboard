document.addEventListener("DOMContentLoaded", async () => {
  // URL params
  const urlParams = new URLSearchParams(window.location.search);
  const memberId = urlParams.get("memberId");

  if (!memberId) {
    console.error("No memberId found in URL");
    return;
  }

  // --- DOM elements ---
  const memberNameEl = document.querySelector(".member-name");
  const memberIdEl = document.querySelector(".member-id");
  const statusBadgeEl = document.querySelector(".status-badge");
  const addressEl = document.querySelector(".div-wrapper .member-address");
  const emailEl = document.querySelector(".email-value");
  const dobEl = document.querySelector(".dob-value");
  const phoneEl = document.querySelector(".phoneNumber-value");

  const emergencyNameEl = document.querySelector(".name-value");
  const emergencyRelationEl = document.querySelector(".relationship-value");
  const emergencyNumberEl = document.querySelector(".number-value");

  const renewalEl = document.querySelector(".renewal-value");
  const startEl = document.querySelector(".start-value");
  const endParaEl = document.querySelector(".card.membership .end-value");

  const deleteBtn = document.getElementById("delete_member");

  // --- helper functions ---
  async function fetchMemberDetails(id) {
    try {
      const res = await fetch(`${baseURL}/api/members/memberId/${id}`);
      if (!res.ok) throw new Error("Failed to fetch member data");
      return await res.json();
    } catch (err) {
      console.error("Error fetching member details:", err);
      return null;
    }
  }

  async function deleteMember(id) {
    try {
      const res = await fetch(`${baseURL}/api/members/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete member");
      return await res.json();
    } catch (err) {
      console.error("Error deleting member:", err);
      throw err;
    }
  }

  // --- load & render member data ---
  const memberData = await fetchMemberDetails(memberId);
  if (memberData) {
    // page title
    document.title = `Member Details - ${memberData.firstName} ${memberData.lastName}`;

    // personal info
    memberNameEl.textContent = `${memberData.firstName} ${memberData.lastName}`;
    memberIdEl.textContent = `Member ID: ${memberData.memberId}`;
    statusBadgeEl.textContent = memberData.membershipType || "N/A";
    addressEl.textContent = `Address: ${memberData.address || "N/A"}`;
    emailEl.textContent = memberData.email;
    dobEl.textContent = memberData.dob
      ? new Date(memberData.dob).toLocaleDateString()
      : "N/A";
    phoneEl.textContent = memberData.personalPhoneNumber || "N/A";

    // emergency contact
    emergencyNameEl.textContent = memberData.emergencyContact?.name || "N/A";
    emergencyRelationEl.textContent =
      memberData.emergencyContact?.relationship || "N/A";
    emergencyNumberEl.textContent =
      memberData.emergencyContact?.phoneNumber || "N/A";

    // membership status
    renewalEl.textContent = memberData.renew ? "Active" : "Inactive";
    startEl.textContent = memberData.membershipStartDate
      ? new Date(memberData.membershipStartDate).toLocaleDateString()
      : "N/A";

    // end date (no warning icon)
    endParaEl.textContent = memberData.membershipEndDate
      ? new Date(memberData.membershipEndDate).toLocaleDateString()
      : "N/A";
  }

  // --- delete handler ---
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      await deleteMember(memberId);
      alert("Member deleted successfully.");
      window.history.back();
    } catch {
      alert("Error deleting member. Please try again later.");
    }
  });
});
