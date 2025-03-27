const baseURL = "http://localhost:5000";

// LAODING
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  loading.style.display = "none";
});

// SEARCH
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("resultsContainer");
  const resultsList = document.getElementById("resultsList");

  // Debounce function to limit API calls
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  }

  // Fetch search results from the API endpoint
  async function performSearch(query) {
    try {
      const response = await fetch(
        `${baseURL}/api/members/search?query=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        return await response.json();
      } else {
        console.error("Error fetching search results");
        return [];
      }
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }

  // Handle search input changes
  async function handleSearch(e) {
    const query = e.target.value.trim();

    // If query is empty, clear results and hide container
    if (!query) {
      resultsList.innerHTML = "";
      resultsContainer.classList.remove("active");
      return;
    }

    const members = await performSearch(query);
    // Only take the first 6 results
    const limitedMembers = members.slice(0, 6);

    // Clear previous results
    resultsList.innerHTML = "";

    // Populate the list with new results
    limitedMembers.forEach((member) => {
      const li = document.createElement("li");
      li.classList.add("result-item");
      li.innerHTML = `
        <span class="member-name">${member.firstName} ${member.lastName}</span>
        <span class="member-id">${member.memberId}</span>
        <span class="member-email">${member.email}</span>
      `;
      // On click, redirect to the detail page passing the memberId in query parameters
      li.addEventListener("click", () => {
        window.location.href = `/admin/pages/member-detail?memberId=${encodeURIComponent(
          member.memberId
        )}`;
      });
      resultsList.appendChild(li);
    });

    // Show or hide the container based on results
    if (limitedMembers.length > 0) {
      resultsContainer.classList.add("active");
    } else {
      resultsContainer.classList.remove("active");
    }
  }

  // Add debounced keyup listener to the search input
  searchInput.addEventListener("keyup", debounce(handleSearch, 300));
});

// NOTIFICATION
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("DOMContentLoaded", function () {
    // Initialize Socket.IO connection
    const socket = io(baseURL);

    const notiBell = document.getElementById("notiBell");
    const notiCount = document.getElementById("notiCount");
    const notiModal = document.getElementById("notiModal");
    const notifactionData = document.getElementById("notificationData");
    const markAllBtn = document.querySelector(".noti-filter");

    // Prevent clicks on the notification count from toggling the modal
    notiCount.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    // Socket.IO listeners
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    // Listen for new notifications and updates
    socket.on("newNotification", fetchNotifications);
    socket.on("notification-update", fetchNotifications);

    // Fetch notifications from the backend
    async function fetchNotifications() {
      try {
        const response = await fetch(`${baseURL}/api/notifications`);
        const notifications = await response.json();
        updateNotificationUI(notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    // Update the notification UI
    function updateNotificationUI(notifications) {
      notifactionData.innerHTML = ""; // Clear existing notifications

      if (notifications.length === 0) {
        notifactionData.innerHTML = `<div class="noNoti-Data"><p>No Notification</p></div>`;
        notiCount.textContent = "0";
        notiCount.style.display = "none"; // Hide the notification count
        return;
      }

      // Calculate unread count
      const unreadCount = notifications.filter((noti) => !noti.isRead).length;
      notiCount.textContent = unreadCount;
      notiCount.style.display = unreadCount > 0 ? "block" : "none";

      // Show only the first 4 notifications
      const notificationsToShow = notifications.slice(0, 4);
      notificationsToShow.forEach((noti) => {
        const notiItem = document.createElement("div");
        notiItem.className = `noti-data ${noti.isRead ? "" : "unread"}`;
        notiItem.innerHTML = `
          <div class="noti-head">${
            noti.type === "application"
              ? "New Application"
              : "Membership Update"
          }</div>
          <div class="noti-message">${noti.message}</div>
          <div class="noti-time">${new Date(
            noti.createdAt
          ).toLocaleString()}</div>
        `;

        if (!noti.isRead) {
          notiItem.addEventListener("click", async () => {
            const success = await markAsRead(noti._id);
            if (success) {
              fetchNotifications();
            }
          });
        }
        notifactionData.appendChild(notiItem);
      });
    }

    // Mark a single notification as read and refresh the UI
    async function markAsRead(id) {
      try {
        const response = await fetch(`${baseURL}/api/notifications/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          socket.emit("notification-read", id); // Notify server
          return true;
        }
        throw new Error("Failed to mark notification as read");
      } catch (error) {
        console.error("Error marking notification as read:", error);
        return false;
      }
    }

    // Mark all notifications as read and refresh the UI
    markAllBtn.addEventListener("click", async function (event) {
      event.stopPropagation(); // Prevent the click from toggling the modal
      try {
        const response = await fetch(`${baseURL}/api/notifications`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          socket.emit("all-notifications-read");
          fetchNotifications();
        }
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    });

    // Initial fetch of notifications
    fetchNotifications();

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      socket.disconnect();
    });
  });
});
