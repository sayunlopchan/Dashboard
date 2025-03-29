// APPLICATION POST FORM
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("applicationForm");
  if (!form) return;

  // Helper: Get trimmed value by element ID
  const getValue = (id) => {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
  };

  // Helper: Get value of checked radio button by name
  const getCheckedValue = (name) => {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  };

  // Map for membership periods
  const membershipPeriodMap = {
    1: "1 month",
    3: "3 months",
    12: "1 year",
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Construct form data FIRST
    const formData = {
      firstName: getValue("firstname"),
      lastName: getValue("lastname"),
      email: getValue("email"),
      personalPhoneNumber: getValue("number"),
      address: getValue("address"),
      dob: getValue("dob"),
      gender: getCheckedValue("gender"),
      emergencyContact: {
        name: getValue("emergency-name"),
        relationship: getValue("relationship"),
        phoneNumber: getValue("emergency-phone"),
      },
      additionalInfo: getValue("additional-info") || "none",
      membershipType: getCheckedValue("membershipType"),
      membershipPeriod: membershipPeriodMap[getValue("membershipPeriod")] || "",
      membershipStartDate: getValue("startDate"),
    };

    // Validate form after saving
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/applications/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      alert("Application submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error:", error);
      alert(
        error.message || "An error occurred while submitting the application"
      );
    }
  });
});

//PROGRESS BAR
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("applicationForm");
  if (!form) return;

  const progressNums = document.querySelectorAll(".progress-num");
  const lines = document.querySelectorAll(".line");
  const formSections = document.querySelectorAll(".form-section");

  // Validate HTML structure
  if (
    progressNums.length !== 4 ||
    lines.length !== 3 ||
    formSections.length !== 3
  ) {
    console.error("HTML structure mismatch!");
    return;
  }

  // Progress tracking configuration
  const progressMap = [
    { section: formSections[0], num: progressNums[0], line: lines[0] },
    { section: formSections[1], num: progressNums[1], line: lines[1] },
    { section: formSections[2], num: progressNums[2], line: lines[2] },
  ];

  const updateProgress = () => {
    let allComplete = true;

    progressMap.forEach(({ section, num, line }) => {
      const complete = isSectionComplete(section);
      num.classList.toggle("active", complete);
      if (line) line.classList.toggle("active", complete);
      allComplete = allComplete && complete;
    });

    // Update final submit step
    progressNums[3].classList.toggle("active", allComplete);
  };

  const isSectionComplete = (section) => {
    const fields = section.querySelectorAll("input, select, textarea");
    const requiredFields = Array.from(fields).filter((f) => f.required);

    // Check radio groups
    const radioGroups = new Set();
    requiredFields.forEach((field) => {
      if (field.type === "radio") radioGroups.add(field.name);
    });

    for (const groupName of radioGroups) {
      const checked = section.querySelector(
        `input[name="${groupName}"]:checked`
      );
      if (!checked) return false;
    }

    // Check other required fields
    return requiredFields
      .filter((f) => f.type !== "radio")
      .every((field) => {
        if (field.tagName === "SELECT") return field.value !== "";
        return field.value.trim() !== "";
      });
  };

  form.addEventListener("input", updateProgress);
  updateProgress(); // Initial update
});
