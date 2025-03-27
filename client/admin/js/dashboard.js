// ADD RENEW
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const renewForm = document.getElementById("renew-membership-form");
  const memberIdInput = document.getElementById("member-id");
  const membershipTypeSelect = document.getElementById("membership-type");
  const membershipPeriodSelect = document.getElementById("membership-period");
  const resultDiv = document.querySelector(".result");

  // Configuration
  const DEBOUNCE_DELAY = 500;
  const API_ENDPOINTS = {
    MEMBER_DETAILS: "/api/members/memberId/",
    RENEW: "/api/members/renew/",
  };

  // Debounce Implementation
  let debounceTimeout;

  // Event Listeners
  memberIdInput.addEventListener("input", handleMemberInput);
  renewForm.addEventListener("submit", handleFormSubmit);

  // Handle Member Input (Debounced)
  async function handleMemberInput(e) {
    clearTimeout(debounceTimeout);
    const memberId = e.target.value.trim();
    resultDiv.innerHTML = "";

    if (!memberId) return;

    debounceTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `${baseURL}${API_ENDPOINTS.MEMBER_DETAILS}${memberId}`
        );
        if (!response.ok) throw new Error("Member not found");

        const data = await response.json();
        displayMemberInfo(data);
      } catch (error) {
        displayError(error.message);
      }
    }, DEBOUNCE_DELAY);
  }

  // Handle Form Submission (Updated)
  async function handleFormSubmit(e) {
    e.preventDefault();
    resultDiv.innerHTML = "";

    const memberId = memberIdInput.value.trim();
    const membershipType = membershipTypeSelect.value;
    const membershipPeriod = membershipPeriodSelect.value;

    if (!validateInputs(memberId, membershipType, membershipPeriod)) return;

    try {
      // Mapping values to server-expected formats
      const typeMap = {
        1: "basic",
        3: "premium",
      };

      const periodMap = {
        1: "1 month",
        3: "3 months",
        12: "1 year",
      };

      const payload = {
        membershipType: typeMap[membershipType],
        membershipPeriod: periodMap[membershipPeriod],
      };

      const response = await fetch(
        `${baseURL}${API_ENDPOINTS.RENEW}${memberId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Renewal failed");
      }

      // Fetch updated member data with history
      const updatedResponse = await fetch(
        `${baseURL}${API_ENDPOINTS.MEMBER_DETAILS}${memberId}`
      );
      const updatedMember = await updatedResponse.json();

      displaySuccess("Membership renewed successfully!");
      displayMemberInfo(updatedMember);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      displayError(error.message);
    }
  }

  // Validate Inputs
  function validateInputs(memberId, type, period) {
    if (!memberId) {
      displayError("Please enter a valid Member ID");
      return false;
    }

    if (!["1", "3"].includes(type)) {
      displayError("Please select a valid membership type");
      return false;
    }

    if (!["1", "3", "12"].includes(period)) {
      displayError("Please select a valid membership period");
      return false;
    }

    return true;
  }

  // Display Member Info with History
  function displayMemberInfo(data) {
    resultDiv.innerHTML = `
    <p><strong>${data.firstName} ${data.lastName}</strong></p>
    <p>Membership: ${data.membershipType.toUpperCase()}</p>
    <p>Membership Period: ${data.membershipPeriod.replace(/^\w/, (c) =>
      c.toUpperCase()
    )}</p>
    <p>Start Date: ${formatDate(data.membershipStartDate)}</p>
    <p>Expiry Date: ${formatDate(data.membershipEndDate)}</p>
  `;
  }

  // Format Date
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Display Error Message
  function displayError(message) {
    const errorHtml = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      ${message}
    </div>
  `;
    resultDiv.innerHTML = errorHtml;
  }

  // Display Success Message
  function displaySuccess(message) {
    const successHtml = `
    <div class="success-message">
      <i class="fas fa-check-circle"></i>
      ${message}
    </div>
  `;
    resultDiv.insertAdjacentHTML("afterbegin", successHtml);
  }

  // Reset Form
  function resetForm() {
    membershipTypeSelect.value = "";
    membershipPeriodSelect.value = "";
    memberIdInput.value = "";
  }
});

// ADD MEMBER
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".form-container")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get the submit button
      const submitButton = e.target.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent; // Save the original button text

      // Update the button text to "Creating..."
      submitButton.textContent = "Creating...";
      submitButton.disabled = true; // Disable the button to prevent multiple submissions

      // Collect form data
      const formData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        personalPhoneNumber: document
          .getElementById("personalPhoneNumber")
          .value.trim(),
        address: document.getElementById("address").value.trim(),
        gender: document.getElementById("gender").value,
        dob: document.getElementById("dob").value,
        emergencyContact: {
          name: document.getElementById("emergencyContactName").value.trim(),
          relationship: document.getElementById("relationship").value.trim(),
          phoneNumber: document
            .getElementById("emergencyContactPhone")
            .value.trim(),
        },
        additionalInfo:
          document.getElementById("additionalInfo").value.trim() || "none",
        membershipType: document.getElementById("membershipType").value,
        membershipPeriod: document.getElementById("membershipPeriod").value,
        membershipStartDate: document.getElementById("membershipStartDate")
          .value,
      };

      // Basic validation for required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.personalPhoneNumber ||
        !formData.address ||
        !formData.dob ||
        !formData.emergencyContact.name ||
        !formData.emergencyContact.relationship ||
        !formData.emergencyContact.phoneNumber ||
        !formData.membershipStartDate
      ) {
        alert("Please fill in all required fields.");
        submitButton.textContent = originalButtonText; // Restore the original button text
        submitButton.disabled = false; // Re-enable the button
        return;
      }

      try {
        const response = await fetch(`${baseURL}/api/members/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to create member");
        }

        alert("Member created successfully!");
        e.target.reset(); // Reset the form
      } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
      } finally {
        // Restore the original button text and re-enable the button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
});

// OVERVIEW STATS CARD
document.addEventListener("DOMContentLoaded", async () => {
  // Connect to Socket.IO
  const socket = io(baseURL);
  console.log("overview check", baseURL);
  // Cached data
  let cachedMembers = [];
  let cachedApplications = [];

  // Debounce updateMetrics to avoid excessive DOM updates
  let updateTimeout;
  function debouncedUpdateMetrics() {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      updateMetrics(cachedMembers, cachedApplications);
    }, 100); // Adjust delay as needed
  }

  // Listen for a new member creation event
  socket.on("newMember", (member) => {
    console.log("New member created:", member);
    // Check if the member is already in the cache; if not, add it
    if (!cachedMembers.find((m) => m._id === member._id)) {
      cachedMembers.push(member);
      debouncedUpdateMetrics();
    }
  });

  // Listen for full members data update if needed
  socket.on("membersData", (data) => {
    console.log("Members data updated:", data);
    cachedMembers = data.members;
    debouncedUpdateMetrics();
  });

  // Utility to safely add application avoiding duplicates (by unique id)
  function addApplication(newApp) {
    // Use _id or applicationId depending on your data structure.
    const id = newApp._id || newApp.applicationId || newApp.id;
    if (
      !cachedApplications.find(
        (app) => (app._id || app.applicationId || app.id) === id
      )
    ) {
      cachedApplications.push(newApp);
    }
  }

  // Listen for new applications (from a dedicated event)
  socket.on("newApplication", (application) => {
    console.log("New application received:", application);
    addApplication(application);
    debouncedUpdateMetrics();
  });

  // Listen for updated applications data
  socket.on("newApplicationsData", (appData) => {
    console.log("New applications data received:", appData);
    if (Array.isArray(appData)) {
      // Replace the cache only if it is a full data array
      cachedApplications = appData;
    } else {
      // Otherwise, add the single application if not already present
      addApplication(appData);
    }
    debouncedUpdateMetrics();
  });

  // Listen for application removal
  socket.on("applicationRemoved", (applicationId) => {
    console.log("Application removed:", applicationId);
    cachedApplications = cachedApplications.filter((app) => {
      const id = app._id || app.applicationId || app.id;
      return id !== applicationId;
    });
    debouncedUpdateMetrics();
  });

  // Listen for application approval
  socket.on("applicationApproved", ({ applicationId, member }) => {
    console.log("Application approved:", applicationId, member);
    cachedApplications = cachedApplications.map((app) => {
      const id = app._id || app.applicationId || app.id;
      return id === applicationId ? { ...app, approved: true } : app;
    });
    debouncedUpdateMetrics();
  });

  async function fetchData() {
    try {
      const [membersRes, appsRes] = await Promise.all([
        fetch(`${baseURL}/api/members`),
        fetch(`${baseURL}/api/applicationsdata`),
      ]);
      const members = await membersRes.json();
      const applications = await appsRes.json();
      return { members, applications };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { members: [], applications: [] };
    }
  }

  // Utility to calculate percentage difference
  function calculatePercentage(current, previous) {
    if (current === previous) return "0%";
    if (previous === 0)
      return current === 0 ? "N/A" : `+${(current * 100).toFixed(1)}%`;
    const percentage = ((current - previous) / previous) * 100;
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
  }

  // Update DOM metrics based on cachedMembers and cachedApplications
  function updateMetrics(members, applications) {
    const now = new Date();
    const currentMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );
    const lastMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)
    );

    // Total Members
    const totalMembersCount = members.length;
    document.getElementById("totalMembers").textContent = totalMembersCount;
    const totalNewCurrent = members.filter(
      (m) => new Date(m.createdAt) >= currentMonthStart
    ).length;
    const totalNewLast = members.filter((m) => {
      const d = new Date(m.createdAt);
      return d >= lastMonthStart && d < currentMonthStart;
    }).length;
    document.querySelector(
      ".totalMemberPer"
    ).textContent = `${calculatePercentage(
      totalNewCurrent,
      totalNewLast
    )} vs last month`;

    // New Members (e.g., members created in the current month)
    document.getElementById("members").textContent = totalNewCurrent;
    document.querySelector(".memberPer").textContent = `${calculatePercentage(
      totalNewCurrent,
      totalNewLast
    )} vs last month`;

    // Applications (if required)
    const appsCurrent = applications.filter(
      (app) => new Date(app.date) >= currentMonthStart
    ).length;
    const appsLast = applications.filter((app) => {
      const d = new Date(app.date);
      return d >= lastMonthStart && d < currentMonthStart;
    }).length;
    document.getElementById("application").textContent = appsCurrent;
    document.querySelector(
      ".applicationPer"
    ).textContent = `${calculatePercentage(
      appsCurrent,
      appsLast
    )} vs last month`;

    // Upcoming Members / Renewals
    const renewalsCurrent = members.filter(
      (m) =>
        m.paymentDate?.length > 1 &&
        new Date(m.paymentDate[m.paymentDate.length - 1]) >= currentMonthStart
    ).length;
    const renewalsLast = members.filter(
      (m) =>
        m.paymentDate?.length > 1 &&
        new Date(m.paymentDate[m.paymentDate.length - 1]) >= lastMonthStart &&
        new Date(m.paymentDate[m.paymentDate.length - 1]) < currentMonthStart
    ).length;
    document.getElementById("totalRenewals").textContent = renewalsCurrent;
    document.querySelector(
      ".totalRenewPer"
    ).textContent = `${calculatePercentage(
      renewalsCurrent,
      renewalsLast
    )} vs last month`;

    // Premium Members
    const premiumCurrent = members.filter(
      (m) =>
        m.membershipType === "premium" &&
        new Date(m.createdAt) >= currentMonthStart
    ).length;
    const premiumLast = members.filter(
      (m) =>
        m.membershipType === "premium" &&
        new Date(m.createdAt) >= lastMonthStart &&
        new Date(m.createdAt) < currentMonthStart
    ).length;
    document.getElementById("premiumMember").textContent = premiumCurrent;
    document.querySelector(
      ".premiumMemberPer"
    ).textContent = `${calculatePercentage(
      premiumCurrent,
      premiumLast
    )} vs last month`;

    // Basic Members
    const basicCurrent = members.filter(
      (m) =>
        m.membershipType === "basic" &&
        new Date(m.createdAt) >= currentMonthStart
    ).length;
    const basicLast = members.filter(
      (m) =>
        m.membershipType === "basic" &&
        new Date(m.createdAt) >= lastMonthStart &&
        new Date(m.createdAt) < currentMonthStart
    ).length;
    document.getElementById("basicMember").textContent = basicCurrent;
    document.querySelector(
      ".basicMemberPer"
    ).textContent = `${calculatePercentage(
      basicCurrent,
      basicLast
    )} vs last month`;
  }
  document.addEventListener("DOMContentLoaded", async () => {
    const socket = io(baseURL);

    let cachedMembers = [];
    let cachedApplications = [];

    let updateTimeout;
    function debouncedUpdateMetrics() {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(
        () => updateMetrics(cachedMembers, cachedApplications),
        100
      );
    }

    function addApplication(newApp) {
      const id = newApp._id || newApp.applicationId || newApp.id;
      if (
        !cachedApplications.some(
          (app) => (app._id || app.applicationId || app.id) === id
        )
      ) {
        cachedApplications.push(newApp);
      }
    }

    // Socket event listeners
    socket.on("newApplication", (application) => {
      addApplication(application);
      debouncedUpdateMetrics();
    });

    socket.on("newApplicationsData", (appData) => {
      Array.isArray(appData)
        ? (cachedApplications = appData)
        : addApplication(appData);
      debouncedUpdateMetrics();
    });

    socket.on("applicationRemoved", (applicationId) => {
      cachedApplications = cachedApplications.filter(
        (app) => (app._id || app.applicationId || app.id) !== applicationId
      );
      debouncedUpdateMetrics();
    });

    socket.on("applicationApproved", ({ applicationId, member }) => {
      cachedApplications = cachedApplications.map((app) =>
        (app._id || app.applicationId || app.id) === applicationId
          ? { ...app, approved: true }
          : app
      );

      if (!cachedMembers.some((m) => m._id === member._id)) {
        cachedMembers.push(member);
      }
      debouncedUpdateMetrics();
    });

    // New listener for member registrations
    socket.on("newMember", (member) => {
      if (!cachedMembers.some((m) => m._id === member._id)) {
        cachedMembers.push(member);
        debouncedUpdateMetrics();
      }
    });

    // Existing members data listener
    socket.on("membersData", (data) => {
      cachedMembers = data.members;
      debouncedUpdateMetrics();
    });

    async function fetchData() {
      try {
        const [membersRes, appsRes] = await Promise.all([
          fetch(`${baseURL}/api/members`),
          fetch(`${baseURL}/api/applicationsdata`),
        ]);
        return {
          members: await membersRes.json(),
          applications: await appsRes.json(),
        };
      } catch (error) {
        console.error("Fetch error:", error);
        return { members: [], applications: [] };
      }
    }

    // Update DOM metrics based on cachedMembers and cachedApplications
    function updateMetrics(members, applications) {
      const now = new Date();
      const currentMonthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
      );
      const lastMonthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)
      );

      // Total Members
      const totalMembersCount = members.length;
      document.getElementById("totalMembers").textContent = totalMembersCount;
      const totalNewCurrent = members.filter(
        (m) => new Date(m.createdAt) >= currentMonthStart
      ).length;
      const totalNewLast = members.filter((m) => {
        const d = new Date(m.createdAt);
        return d >= lastMonthStart && d < currentMonthStart;
      }).length;
      document.querySelector(
        ".totalMemberPer"
      ).textContent = `${calculatePercentage(
        totalNewCurrent,
        totalNewLast
      )} vs last month`;

      // New Members (e.g., members created in the current month)
      document.getElementById("members").textContent = totalNewCurrent;
      document.querySelector(".memberPer").textContent = `${calculatePercentage(
        totalNewCurrent,
        totalNewLast
      )} vs last month`;

      // Applications (if required)
      const appsCurrent = applications.filter(
        (app) => new Date(app.date) >= currentMonthStart
      ).length;
      const appsLast = applications.filter((app) => {
        const d = new Date(app.date);
        return d >= lastMonthStart && d < currentMonthStart;
      }).length;
      document.getElementById("application").textContent = appsCurrent;
      document.querySelector(
        ".applicationPer"
      ).textContent = `${calculatePercentage(
        appsCurrent,
        appsLast
      )} vs last month`;

      // Upcoming Members / Renewals
      const renewalsCurrent = members.filter(
        (m) =>
          m.paymentDate?.length > 1 &&
          new Date(m.paymentDate[m.paymentDate.length - 1]) >= currentMonthStart
      ).length;
      const renewalsLast = members.filter(
        (m) =>
          m.paymentDate?.length > 1 &&
          new Date(m.paymentDate[m.paymentDate.length - 1]) >= lastMonthStart &&
          new Date(m.paymentDate[m.paymentDate.length - 1]) < currentMonthStart
      ).length;
      document.getElementById("totalRenewals").textContent = renewalsCurrent;
      document.querySelector(
        ".totalRenewPer"
      ).textContent = `${calculatePercentage(
        renewalsCurrent,
        renewalsLast
      )} vs last month`;

      // Premium Members
      const premiumCurrent = members.filter(
        (m) =>
          m.membershipType === "premium" &&
          new Date(m.createdAt) >= currentMonthStart
      ).length;
      const premiumLast = members.filter(
        (m) =>
          m.membershipType === "premium" &&
          new Date(m.createdAt) >= lastMonthStart &&
          new Date(m.createdAt) < currentMonthStart
      ).length;
      document.getElementById("premiumMember").textContent = premiumCurrent;
      document.querySelector(
        ".premiumMemberPer"
      ).textContent = `${calculatePercentage(
        premiumCurrent,
        premiumLast
      )} vs last month`;

      // Basic Members
      const basicCurrent = members.filter(
        (m) =>
          m.membershipType === "basic" &&
          new Date(m.createdAt) >= currentMonthStart
      ).length;
      const basicLast = members.filter(
        (m) =>
          m.membershipType === "basic" &&
          new Date(m.createdAt) >= lastMonthStart &&
          new Date(m.createdAt) < currentMonthStart
      ).length;
      document.getElementById("basicMember").textContent = basicCurrent;
      document.querySelector(
        ".basicMemberPer"
      ).textContent = `${calculatePercentage(
        basicCurrent,
        basicLast
      )} vs last month`;
    }

    // Initial load
    const { members, applications } = await fetchData();
    cachedMembers = members;
    cachedApplications = applications;
    updateMetrics(cachedMembers, cachedApplications);

    // Fallback and cleanup
    setTimeout(async () => {
      if (document.getElementById("totalMembers").textContent === "0") {
        const { members } = await fetchData();
        cachedMembers = members;
        updateMetrics(cachedMembers, cachedApplications);
      }
    }, 5000);

    window.addEventListener("beforeunload", () => {
      socket.removeAllListeners();
    });
  });
  // Initial load of data
  const { members, applications } = await fetchData();
  cachedMembers = members;
  cachedApplications = applications;
  updateMetrics(cachedMembers, cachedApplications);

  // Fallback: if socket fails, refresh via HTTP after 5 seconds
  setTimeout(async () => {
    if (document.getElementById("totalMembers").textContent === "0") {
      const { members } = await fetchData();
      cachedMembers = members;
      updateMetrics(cachedMembers, cachedApplications);
    }
  }, 5000);

  // Cleanup socket event listeners on unload to prevent memory leaks
  window.addEventListener("beforeunload", () => {
    socket.removeAllListeners();
  });
});

// CHART
document.addEventListener("DOMContentLoaded", () => {
  // Connect to the Socket.IO server.
  const socket = io(baseURL);

  // HTTP fetch for later use (e.g. when the user changes the filter)
  async function fetchData() {
    try {
      const res = await fetch(`${baseURL}/api/members`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const members = await res.json();
      return { members };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { members: [] };
    }
  }

  // Helper functions for filtering upcoming members by month/year
  function filterUpcomingForMonth(data, month, year) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return data.filter((member) => {
      const startDate = new Date(member.membershipStartDate);
      startDate.setHours(0, 0, 0, 0);
      return (
        startDate >= today &&
        startDate.getMonth() === month &&
        startDate.getFullYear() === year
      );
    });
  }

  function filterUpcomingForYear(data, year) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return data.filter((member) => {
      const startDate = new Date(member.membershipStartDate);
      startDate.setHours(0, 0, 0, 0);
      return startDate >= today && startDate.getFullYear() === year;
    });
  }

  // Process API data and compute stats
  function processData(apiData) {
    const { members } = apiData;
    members.forEach((member) => {
      member.createdAt = new Date(member.createdAt);
      member.membershipStartDate = new Date(member.membershipStartDate);
      if (member.paymentDate && member.paymentDate.length > 0) {
        member.lastPaymentDate = new Date(
          member.paymentDate[member.paymentDate.length - 1]
        );
      }
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filterByMonth = (data, month, year) =>
      data.filter((member) => {
        const d = member.createdAt;
        return d.getMonth() === month && d.getFullYear() === year;
      });

    const filterByYear = (data, year) =>
      data.filter((member) => member.createdAt.getFullYear() === year);

    function buildStats(period) {
      let currentData = [];
      let previousData = [];
      if (period === "this_month") {
        currentData = filterByMonth(members, currentMonth, currentYear);
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        previousData = filterByMonth(members, prevMonth, prevYear);
      } else if (period === "last_month") {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        currentData = filterByMonth(members, lastMonth, currentYear);
        let compMonth = lastMonth === 0 ? 11 : lastMonth - 1;
        let compYear = lastMonth === 0 ? currentYear - 1 : currentYear;
        previousData = filterByMonth(members, compMonth, compYear);
      } else if (period === "this_year") {
        currentData = filterByYear(members, currentYear);
        previousData = filterByYear(members, currentYear - 1);
      } else if (period === "last_year") {
        currentData = filterByYear(members, currentYear - 1);
        previousData = filterByYear(members, currentYear - 2);
      }

      const totalMembers = members.length;
      const currentNew = currentData.length;
      const previousNew = previousData.length;
      const totalGrowth =
        previousNew > 0
          ? ((currentNew - previousNew) / previousNew) * 100
          : currentNew > 0
          ? 100
          : 0;

      const newMembers = currentData.length;
      const newGrowth =
        previousNew > 0
          ? ((newMembers - previousNew) / previousNew) * 100
          : newMembers > 0
          ? 100
          : 0;

      const renewalsCurrent = currentData.filter(
        (member) => member.paymentDate && member.paymentDate.length > 1
      ).length;
      const renewalsPrevious = previousData.filter(
        (member) => member.paymentDate && member.paymentDate.length > 1
      ).length;
      const renewalsGrowth =
        renewalsPrevious > 0
          ? ((renewalsCurrent - renewalsPrevious) / renewalsPrevious) * 100
          : renewalsCurrent > 0
          ? 100
          : 0;

      const premiumMembers = currentData.filter(
        (member) => member.membershipType === "premium"
      ).length;
      const premiumPrevious = previousData.filter(
        (member) => member.membershipType === "premium"
      ).length;
      const premiumGrowth =
        premiumPrevious > 0
          ? ((premiumMembers - premiumPrevious) / premiumPrevious) * 100
          : premiumMembers > 0
          ? 100
          : 0;

      const basicMembers = currentData.filter(
        (member) => member.membershipType === "basic"
      ).length;
      const basicPrevious = previousData.filter(
        (member) => member.membershipType === "basic"
      ).length;
      const basicGrowth =
        basicPrevious > 0
          ? ((basicMembers - basicPrevious) / basicPrevious) * 100
          : basicMembers > 0
          ? 100
          : 0;

      let upcomingCurrent = 0,
        upcomingPrevious = 0;
      if (period === "this_month") {
        upcomingCurrent = filterUpcomingForMonth(
          members,
          currentMonth,
          currentYear
        ).length;
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        upcomingPrevious = filterUpcomingForMonth(
          members,
          prevMonth,
          prevYear
        ).length;
      } else if (period === "last_month") {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        upcomingCurrent = filterUpcomingForMonth(
          members,
          lastMonth,
          currentYear
        ).length;
        let compMonth = lastMonth === 0 ? 11 : lastMonth - 1;
        let compYear = lastMonth === 0 ? currentYear - 1 : currentYear;
        upcomingPrevious = filterUpcomingForMonth(
          members,
          compMonth,
          compYear
        ).length;
      } else if (period === "this_year") {
        upcomingCurrent = filterUpcomingForYear(members, currentYear).length;
        upcomingPrevious = filterUpcomingForYear(
          members,
          currentYear - 1
        ).length;
      } else if (period === "last_year") {
        upcomingCurrent = filterUpcomingForYear(
          members,
          currentYear - 1
        ).length;
        upcomingPrevious = filterUpcomingForYear(
          members,
          currentYear - 2
        ).length;
      }
      const upcomingGrowth =
        upcomingPrevious > 0
          ? ((upcomingCurrent - upcomingPrevious) / upcomingPrevious) * 100
          : upcomingCurrent > 0
          ? 100
          : 0;

      return {
        label: period,
        stats: {
          totalMembers,
          totalGrowth,
          newMembers,
          newGrowth,
          renewals: renewalsCurrent,
          renewalsGrowth,
          premiumMembers,
          premiumGrowth,
          basicMembers,
          basicGrowth,
          upcomingMembers: upcomingCurrent,
          upcomingGrowth,
        },
      };
    }

    return {
      this_month: buildStats("this_month"),
      last_month: buildStats("last_month"),
      this_year: buildStats("this_year"),
      last_year: buildStats("last_year"),
    };
  }

  // Initialize Chart.js chart.
  const ctx = document.getElementById("analyticsChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Loading...",
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.y !== null) {
                label = `${context.label}: ${context.parsed.y}`;
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: { display: true },
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => value.toLocaleString() },
        },
      },
    },
  });

  // Update stats cards with computed values.
  function updateStatsCards(currentStats, previousStats, period) {
    const formatter = new Intl.NumberFormat("en-US");
    const statsCards = document.querySelectorAll(".analytics-stats-card");
    let comparisonText = "";
    if (period === "this_month" || period === "last_month") {
      comparisonText = "vs last month";
    } else if (period === "this_year" || period === "last_year") {
      comparisonText = "vs last year";
    }

    statsCards.forEach((card) => {
      const title = card.querySelector(".analytics-stats-title").textContent;
      const valueEl = card.querySelector(".analytics-stats-value");
      const growthEl = card.querySelector(".analytics-stats-growth");
      let currentValue = 0,
        growth = 0;
      switch (title) {
        case "Total Members":
          currentValue = currentStats.totalMembers;
          growth =
            previousStats.newMembers > 0
              ? ((currentStats.newMembers - previousStats.newMembers) /
                  previousStats.newMembers) *
                100
              : currentStats.newMembers > 0
              ? 100
              : 0;
          break;
        case "New Members":
          currentValue = currentStats.newMembers;
          growth =
            previousStats.newMembers > 0
              ? ((currentStats.newMembers - previousStats.newMembers) /
                  previousStats.newMembers) *
                100
              : currentStats.newMembers > 0
              ? 100
              : 0;
          break;
        case "Renewals":
          currentValue = currentStats.renewals;
          growth =
            previousStats.renewals > 0
              ? ((currentStats.renewals - previousStats.renewals) /
                  previousStats.renewals) *
                100
              : currentStats.renewals > 0
              ? 100
              : 0;
          break;
        case "Premium Members":
          currentValue = currentStats.premiumMembers;
          growth =
            previousStats.premiumMembers > 0
              ? ((currentStats.premiumMembers - previousStats.premiumMembers) /
                  previousStats.premiumMembers) *
                100
              : currentStats.premiumMembers > 0
              ? 100
              : 0;
          break;
        case "Basic Members":
          currentValue = currentStats.basicMembers;
          growth =
            previousStats.basicMembers > 0
              ? ((currentStats.basicMembers - previousStats.basicMembers) /
                  previousStats.basicMembers) *
                100
              : currentStats.basicMembers > 0
              ? 100
              : 0;
          break;
        case "Upcoming Members":
          currentValue = currentStats.upcomingMembers;
          growth =
            previousStats.upcomingMembers > 0
              ? ((currentStats.upcomingMembers -
                  previousStats.upcomingMembers) /
                  previousStats.upcomingMembers) *
                100
              : currentStats.upcomingMembers > 0
              ? 100
              : 0;
          break;
      }
      valueEl.textContent = formatter.format(currentValue);
      const growthSign = growth >= 0 ? "+" : "";
      growthEl.innerHTML = `${growthSign}${growth.toFixed(
        1
      )}% <span class="comparison-text">${comparisonText}</span>`;
      growthEl.className = `analytics-stats-growth ${
        growth >= 0 ? "positive" : "negative"
      }`;
    });
  }

  // Update chart with computed stats.
  function updateChart(currentStats) {
    const categories = [
      {
        label: "Total Members",
        value: currentStats.totalMembers,
        backgroundColor: "rgba(74,144,226,0.7)",
        borderColor: "rgba(74,144,226,1)",
      },
      {
        label: "New Members",
        value: currentStats.newMembers,
        backgroundColor: "rgba(75,192,192,0.7)",
        borderColor: "rgba(75,192,192,1)",
      },
      {
        label: "Renewals",
        value: currentStats.renewals,
        backgroundColor: "rgba(255,206,86,0.7)",
        borderColor: "rgba(255,206,86,1)",
      },
      {
        label: "Premium Members",
        value: currentStats.premiumMembers,
        backgroundColor: "rgba(153,102,255,0.7)",
        borderColor: "rgba(153,102,255,1)",
      },
      {
        label: "Basic Members",
        value: currentStats.basicMembers,
        backgroundColor: "rgba(255,159,64,0.7)",
        borderColor: "rgba(255,159,64,1)",
      },
      {
        label: "Upcoming Members",
        value: currentStats.upcomingMembers,
        backgroundColor: "rgba(54,162,235,0.7)",
        borderColor: "rgba(54,162,235,1)",
      },
    ];

    // Update chart data
    chart.data.labels = categories.map((cat) => cat.label); // Set labels
    chart.data.datasets[0].data = categories.map((cat) => cat.value); // Set data
    chart.data.datasets[0].backgroundColor = categories.map(
      (cat) => cat.backgroundColor
    );
    chart.data.datasets[0].borderColor = categories.map(
      (cat) => cat.borderColor
    );
    chart.data.datasets[0].label = "Membership Statistics"; // Set a generic label for the dataset

    // Update the chart
    chart.update();
  }

  // Use socket for the initial data fetch.
  socket.emit("fetchMembers");

  // Add to your existing socket listeners

  socket.on("membersData", (apiData) => {
    const timePeriodData = processData(apiData);
    updateChart(timePeriodData.this_month.stats);
    updateStatsCards(
      timePeriodData.this_month.stats,
      timePeriodData.last_month.stats,
      "this_month"
    );
  });

  // Fallback: after 5 seconds, if no data has been received, use HTTP fetch.
  setTimeout(async () => {
    if (chart.data.datasets[0].data.length === 0) {
      console.warn("Socket data not received in time, using HTTP fallback.");
      const apiData = await fetchData();
      const timePeriodData = processData(apiData);
      updateChart(timePeriodData.this_month.stats);
      updateStatsCards(
        timePeriodData.this_month.stats,
        timePeriodData.last_month.stats,
        "this_month"
      );
    }
  }, 5000);

  // Update chart and stats when filter changes.
  document
    .getElementById("timePeriodFilter")
    .addEventListener("change", async (e) => {
      const period = e.target.value;
      const apiData = await fetchData();
      const timePeriodData = processData(apiData);
      let previousStats;
      if (period === "this_month") {
        previousStats = timePeriodData.last_month.stats;
      } else if (period === "last_month") {
        previousStats = timePeriodData.this_month.stats;
      } else if (period === "this_year") {
        previousStats = timePeriodData.last_year.stats;
      } else if (period === "last_year") {
        previousStats = timePeriodData.this_year.stats;
      }
      updateChart(timePeriodData[period].stats);
      updateStatsCards(timePeriodData[period].stats, previousStats, period);
    });
});
