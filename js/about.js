// /js/about.js
function init(params = {}) {
    const values = Object.values(params);
    const userEl = document.getElementById("user-id");
    const postEl = document.getElementById("post-id");
    
    userEl && (userEl.textContent = values[0] ? `ID: ${values[0]}` : "No user selected");
    postEl && (postEl.textContent = `Post ID: ${values[2] || ''}`, postEl.style.display = values[2] ? 'block' : 'none');
}

export { init };