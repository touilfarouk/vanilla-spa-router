// /js/about.js - Comprehensive version
function init(params = {}) {
    const userId = params.userId || params.id;
    const postId = params.postId;
    
    console.log("About page initialized with:", params);
    
    // Update user ID display
    const userIdEl = document.getElementById("user-id");
    if (userIdEl) {
        userIdEl.textContent = userId ? `User ID: ${userId}` : "No user selected";
    }
    
    // Update post ID display if element exists
    const postIdEl = document.getElementById("post-id");
    if (postIdEl) {
        if (postId) {
            postIdEl.textContent = `Post ID: ${postId}`;
            postIdEl.style.display = 'block';
        } else {
            postIdEl.style.display = 'none';
        }
    }
    
    // Create post info if it doesn't exist but we have postId
    if (postId && !postIdEl) {
        const postInfo = document.createElement('div');
        postInfo.id = 'post-info';
        postInfo.innerHTML = `<h3>Post Details</h3><p>Post ID: ${postId}</p>`;
        document.body.appendChild(postInfo);
    }
}

// Export for the router
export { init };