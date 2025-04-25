document.addEventListener("DOMContentLoaded", async () => {
  // URL & BASE CONFIG
  const urlParams = new URLSearchParams(window.location.search);
  const applicationId = urlParams.get("applicationId");

  if (!applicationId) {
    console.error("No applicationId found in URL");
    return;
  }

  // CACHE DOM ELEMENTS
  const appNameEl = document.querySelector(".application-name");
  const addressEl = document.querySelector(".application-address");
  const statusBadgeEl = document.querySelector(".status-badge");

  const emailEl = document.querySelector(".email-value");
  const dobEl = document.querySelector(".dob-value");
  const phoneEl = document.querySelector(".phoneNumber-value");

  const emergencyNameEl = document.querySelector(".name-value");
  const emergencyRelationEl = document.querySelector(".relationship-value");
  const emergencyNumberEl = document.querySelector(".number-value");

  const renewalEl = document.querySelector(".renewal-value");
  const startEl = document.querySelector(".start-value");
  const endEl = document.querySelector(".end-value");

  const acceptBtn = document.getElementById("accept");
  const rejectBtn = document.getElementById("reject");

  // HELPER: FETCH APPLICATION DETAILS
  async function fetchApplicationDetails(id) {
    try {
      const res = await fetch(`${baseURL}/api/applications/${id}`);
      if (!res.ok) throw new Error("Failed to fetch application data");
      return await res.json();
    } catch (err) {
      console.error("Error fetching application details:", err);
      return null;
    }
  }

  // LOAD & RENDER DATA ─────────────────────────────────────────────────────
  const applicationData = await fetchApplicationDetails(applicationId);
  if (applicationData) {
    // Page title
    document.title = `Application Details - ${applicationData.firstName} ${applicationData.lastName}`;

    // Header & Address
    appNameEl.textContent = `${applicationData.firstName} ${applicationData.lastName}`;
    addressEl.textContent = `Address: ${applicationData.address || "N/A"}`;
    statusBadgeEl.textContent = applicationData.membershipType || "N/A";

    // Personal Info
    emailEl.textContent = applicationData.email || "N/A";
    dobEl.textContent = applicationData.dob
      ? new Date(applicationData.dob).toLocaleDateString()
      : "N/A";
    phoneEl.textContent =
      applicationData.phoneNumber ||
      applicationData.personalPhoneNumber ||
      "N/A";

    // Emergency Contact
    emergencyNameEl.textContent =
      applicationData.emergencyContact?.name || "N/A";
    emergencyRelationEl.textContent =
      applicationData.emergencyContact?.relationship || "N/A";
    emergencyNumberEl.textContent =
      applicationData.emergencyContact?.phoneNumber || "N/A";

    // Membership Details
    renewalEl.textContent = applicationData.renew ? "Active" : "Inactive";
    startEl.textContent = applicationData.membershipStartDate
      ? new Date(applicationData.membershipStartDate).toLocaleDateString()
      : "N/A";
    endEl.textContent = applicationData.membershipEndDate
      ? new Date(applicationData.membershipEndDate).toLocaleDateString()
      : "N/A";
  }

  // EVENT HANDLERS ─────────────────────────────────────────────────────────
  acceptBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(
        `${baseURL}/api/applications/${applicationId}/approve`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Failed to approve application");
      alert("Application approved successfully.");
      window.history.back();
    } catch (err) {
      console.error("Error approving application:", err);
      alert("Error approving application. Please try again later.");
    }
  });

  rejectBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${baseURL}/api/applications/${applicationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to reject application");
      alert("Application rejected successfully.");
      window.history.back();
    } catch (err) {
      console.error("Error rejecting application:", err);
      alert("Error rejecting application. Please try again later.");
    }
  });
});
