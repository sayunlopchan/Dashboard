document.addEventListener("DOMContentLoaded", () => {
  // STATE & CONFIG
  let allMembers = [];

  // CACHE DOM ELEMENTS
  const membersContainerEl = document.getElementById("membersContainer");
  const memberTemplateEl = document.getElementById("memberTemplate");
  const filterGenderEl = document.getElementById("filterGender");
  const filterMembershipTypeEl = document.getElementById(
    "filterMembershipType"
  );
  const memberSearchInputEl = document.getElementById("memberSearchInput");

  // HELPERS
  function calcDiffDays(dateStr) {
    if (!dateStr) return Infinity;
    const endDate = new Date(dateStr);
    const today = new Date();
    return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  }

  function formatTimeDiff(diffDays) {
    const absDays = Math.abs(diffDays);
    if (absDays < 7) {
      return `${absDays} day${absDays !== 1 ? "s" : ""}`;
    } else if (absDays < 30) {
      const weeks = Math.round(absDays / 7);
      return `${weeks} week${weeks !== 1 ? "s" : ""}`;
    } else {
      const months = Math.round(absDays / 30);
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
  }

  // WARNING ICON LOGIC
  function addWarning(cardEl, membershipEndDateStr) {
    const warningIcon = cardEl.querySelector(".warning-icon");
    const tooltip = warningIcon.querySelector(".tooltip-text");
    const diffDays = calcDiffDays(membershipEndDateStr);

    // show only if expired or expiring within 30 days
    if (diffDays <= 30) {
      warningIcon.style.display = "flex";

      const timeMsg = formatTimeDiff(diffDays);
      if (diffDays >= 0) {
        tooltip.innerHTML = `Membership will expire in <span class="highlight">${timeMsg}</span>.`;
      } else {
        tooltip.innerHTML =
          `Membership expired <span class="highlight">${timeMsg}</span> ago.<br>` +
          `<span class="highlight">please renew.</span>`;
      }
    } else {
      warningIcon.style.display = "none";
    }
  }

  // FETCH & FILTER
  async function fetchMembers() {
    try {
      const res = await fetch(`${baseURL}/api/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      allMembers = await res.json();
      applyFilters();
    } catch (err) {
      console.error("Error fetching members:", err);
      membersContainerEl.innerHTML =
        '<div class="loading">Error loading members. Please try again later.</div>';
    }
  }

  function applyFilters() {
    const gender = filterGenderEl.value.toLowerCase();
    const membershipType = filterMembershipTypeEl.value.toLowerCase();
    const searchTerm = memberSearchInputEl.value.trim().toLowerCase();

    const filtered = allMembers.filter((member) => {
      const gm = !gender || (member.gender || "").toLowerCase() === gender;
      const mm =
        !membershipType ||
        (member.membershipType || "").toLowerCase() === membershipType;
      const sm =
        !searchTerm ||
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(searchTerm) ||
        (member.email || "").toLowerCase().includes(searchTerm) ||
        member.memberId.toString().includes(searchTerm);
      return gm && mm && sm;
    });

    displayMembers(filtered);
  }

  // ─── RENDER SORTED MEMBERS
  function displayMembers(members) {
    // sort: expired (≤0), expiring soon (1–30), then others
    const sorted = members.slice().sort((a, b) => {
      const da = calcDiffDays(a.membershipEndDate);
      const db = calcDiffDays(b.membershipEndDate);
      const ga = da <= 0 ? 0 : da <= 30 ? 1 : 2;
      const gb = db <= 0 ? 0 : db <= 30 ? 1 : 2;
      if (ga !== gb) return ga - gb;
      return ga === 0 ? Math.abs(da) - Math.abs(db) : da - db;
    });

    membersContainerEl.innerHTML = "";
    sorted.forEach((member) => {
      const card = memberTemplateEl.cloneNode(true);
      card.removeAttribute("id");
      card.style.display = "block";

      card.querySelector(
        ".member-fullname"
      ).textContent = `${member.firstName} ${member.lastName}`;
      card.querySelector(".member-email").textContent = member.email;
      card.querySelector(".member-id span").textContent = member.memberId;

      addWarning(card, member.membershipEndDate);

      card.addEventListener("click", () => {
        window.location.href = `/admin/member-detail?memberId=${encodeURIComponent(
          member.memberId
        )}`;
      });

      membersContainerEl.appendChild(card);
    });
  }

  // ─── EVENT LISTENERS
  filterGenderEl.addEventListener("change", applyFilters);
  filterMembershipTypeEl.addEventListener("change", applyFilters);
  memberSearchInputEl.addEventListener("input", applyFilters);

  // ─── INITIALIZE
  fetchMembers();
});
