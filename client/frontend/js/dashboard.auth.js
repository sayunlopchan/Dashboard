document.addEventListener('DOMContentLoaded', () => {
  const authToken = localStorage.getItem('token');
  const dashboard = document.getElementById('dashboard');
  const notAuthorized = document.getElementById('notAuthorized');

  if (authToken) {
    dashboard.style.display = 'block';
  } else {
    notAuthorized.style.display = 'block';
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    location.reload();
    window.location.href = '/';
  });
});