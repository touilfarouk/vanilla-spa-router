// Define routes (hash-based)
const routes = {
  404: { html: "/pages/404.html", js: null },
  "#/": { html: "/pages/index.html", js: "/js/index.js" },
  "#/about": { html: "/pages/about.html", js: "/js/about.js" },
  "#/lorem": { html: "/pages/lorem.html", js: "/js/lorem.js" },
};

const handleLocation = async () => {
  const path = window.location.hash || "#/"; // default to home
  const route = routes[path] || routes[404];

  // Load HTML content
  const html = await fetch(route.html).then((res) => res.text());
  document.getElementById("main-page").innerHTML = html;

  // Remove old page scripts (optional cleanup)
  document.querySelectorAll("script[data-route]").forEach(el => el.remove());

  // Load JS if available
  if (route.js) {
    const script = document.createElement("script");
    script.src = route.js;
    script.type = "module"; // use ES modules if needed
    script.setAttribute("data-route", ""); // mark for cleanup
    document.body.appendChild(script);
  }
};

// Listen for hash changes
window.addEventListener("hashchange", handleLocation);

// Initial load
handleLocation();
