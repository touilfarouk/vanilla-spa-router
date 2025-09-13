const userId = window.routeParams?.id;

const el = document.getElementById("user-id");
if (el) {
  el.textContent = userId ? `User ID: ${userId}` : "No user selected";
}
