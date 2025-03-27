document.addEventListener("DOMContentLoaded", async () => {
  // Extract applicationId from the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const applicationId = urlParams.get("applicationId");

  if (!applicationId) {
    console.error("No applicationId found in URL");
    return;
  }

  // Fetch application details from the API
  async function fetchApplicationDetails(id) {
    try {
      const response = await fetch(`${baseURL}/api/applications/${id}`);
      if (!response.ok) throw new Error("Failed to fetch application data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching application details:", error);
      return null;
    }
  }

  const applicationData = await fetchApplicationDetails(applicationId);

  if (applicationData) {
    // Update the document title with the applicant's name
    document.title = `Application Details - ${applicationData.firstName} ${applicationData.lastName}`;

    // Update Header Section
    document.querySelector(
      ".application-name"
    ).textContent = `${applicationData.firstName} ${applicationData.lastName}`;
    // Update Address
    document.querySelector(".application-address").textContent = `Address: ${
      applicationData.address || "N/A"
    }`;
    // Update status badge with membership type
    document.querySelector(".status-badge").textContent =
      applicationData.membershipType || "N/A";

    // Update Personal Information Card
    document.querySelector(".email-value").textContent =
      applicationData.email || "N/A";
    document.querySelector(".dob-value").textContent = applicationData.dob
      ? new Date(applicationData.dob).toLocaleDateString()
      : "N/A";
    document.querySelector(".phoneNumber-value").textContent =
      applicationData.phoneNumber ||
      applicationData.personalPhoneNumber ||
      "N/A";

    // Update Emergency Contact Card
    if (applicationData.emergencyContact) {
      document.querySelector(".name-value").textContent =
        applicationData.emergencyContact.name || "N/A";
      document.querySelector(".relationship-value").textContent =
        applicationData.emergencyContact.relationship || "N/A";
      document.querySelector(".number-value").textContent =
        applicationData.emergencyContact.phoneNumber || "N/A";
    } else {
      document.querySelector(".name-value").textContent = "N/A";
      document.querySelector(".relationship-value").textContent = "N/A";
      document.querySelector(".number-value").textContent = "N/A";
    }

    // Update Membership Details Card
    document.querySelector(".renewal-value").textContent = applicationData.renew
      ? "Active"
      : "Inactive";
    document.querySelector(".start-value").textContent =
      applicationData.membershipStartDate
        ? new Date(applicationData.membershipStartDate).toLocaleDateString()
        : "N/A";
    document.querySelector(".end-value").textContent =
      applicationData.membershipEndDate
        ? new Date(applicationData.membershipEndDate).toLocaleDateString()
        : "N/A";
  }

  // Attach event listeners for Accept and Reject buttons
  document.getElementById("accept").addEventListener("click", async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/applications/${applicationId}/approve`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Failed to approve application");
      alert("Application approved and deleted successfully.");
      // after success approve, redirect to applications:
      window.location.href = "/admin/pages/applications";
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Error approving application. Please try again later.");
    }
  });

  document.getElementById("reject").addEventListener("click", async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/applications/${applicationId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to reject application");
      alert("Application rejected and deleted successfully.");
      // redirect the user after rejection:
      window.location.href = "/admin/pages/applications";
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Error rejecting application. Please try again later.");
    }
  });
});
