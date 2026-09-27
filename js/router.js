// router.js - Universal Dynamic Router (PURE)
// Resolve assets from this file so the router works at both `/` and a
// GitHub Pages project path such as `/vanilla-spa-router/`.
const APP_BASE = new URL("../", document.currentScript.src);

const routes = {
  404: { html: "pages/404.html", js: null },
  "#/": { html: "pages/index.html", js: "js/index.js" },
  "#/services": { html: "pages/services.html", js: "js/services.js" },
  "#/products": { html: "pages/products.html", js: "js/products.js" },
  "#/about": { html: "pages/about.html", js: "js/about.js" },
  "#/contact": { html: "pages/contact.html", js: "js/contact.js" },
  "#/lorem": { html: "pages/lorem.html", js: "js/lorem.js" },
  // Add all your 50+ base routes here
};

// Dynamic route matching - handles any number of parameters automatically
function matchRoute(path) {
  const cleanPath = (path || "#/").split("?")[0] || "#/";
  // Try exact match first for static routes
  if (routes[cleanPath]) {
    return { route: routes[cleanPath], params: {} };
  }

  // Extract base path (remove parameters)
  const basePath = extractBasePath(cleanPath);
  
  // Check if base path exists in routes
  if (routes[basePath]) {
    const routeConfig = routes[basePath];
    const params = extractDynamicParams(cleanPath, basePath);
    return { route: routeConfig, params };
  }

  return { route: routes[404], params: {} };
}

// Extract base path from any URL
function extractBasePath(path) {
  const parts = path.split('/').filter(part => part !== '' && part !== '#');
  return parts.length === 0 ? "#/" : "#/" + parts[0];
}

// Extract all parameters dynamically from any path
function extractDynamicParams(fullPath, basePath) {
  const params = {};
  const fullParts = fullPath.split('/').filter(part => part !== '' && part !== '#');
  const baseParts = basePath.split('/').filter(part => part !== '' && part !== '#');
  
  if (fullParts.length <= baseParts.length) return params;
  
  // Extract all segments after base path as parameters
  for (let i = baseParts.length; i < fullParts.length; i++) {
    const paramIndex = i - baseParts.length;
    const paramName = `param${paramIndex + 1}`;
    const paramValue = fullParts[i];
    
    // Auto-detect parameter type
    params[paramName] = detectParamType(paramValue);
  }
  
  return params;
}

// Automatically detect and convert parameter types
function detectParamType(value, shouldDecode = true) {
  if (!value) return value;
  if (shouldDecode) {
    try {
      value = decodeURIComponent(value);
    } catch {
      // Keep malformed encoded values as-is instead of breaking navigation.
    }
  }
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  return value;
}

// Router handler
let navigationId = 0;
const handleLocation = async () => {
  const currentNavigation = ++navigationId;
  const mainPageEl = document.getElementById("main-page");
  if (!mainPageEl) {
    console.error('Router could not find the "main-page" element.');
    return;
  }

  const rawHash = window.location.hash || "#/";
  const queryIndex = rawHash.indexOf("?");
  const path = queryIndex === -1 ? rawHash : rawHash.slice(0, queryIndex);
  const queryString = queryIndex === -1 ? "" : rawHash.slice(queryIndex + 1);
  const { route, params } = matchRoute(path || "#/");

  const query = {};
  if (queryString) {
    for (const [key, value] of new URLSearchParams(queryString)) {
      query[key] = detectParamType(value, false);
    }
  }

  // Keep router params behavior stable: store query separately
  window.routeQuery = query;

  console.log("🌐 Navigating to:", rawHash, "Parameters:", params);

  try {
    const htmlUrl = new URL(route.html, APP_BASE);
    const html = await fetch(htmlUrl).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${htmlUrl}`);
      return res.text();
    });

    if (currentNavigation !== navigationId) return;
    
    mainPageEl.innerHTML = html;
    document.querySelectorAll("script[data-route]").forEach(el => el.remove());
    
    // PURE UNIVERSAL ROUTER - No route-specific logic here!
    window.routeParams = params;
    
    if (route.js) {
      const scriptUrl = new URL(route.js, APP_BASE);
      scriptUrl.searchParams.set("v", Date.now());
      import(scriptUrl.href)
        .then(module => { 
          if (currentNavigation !== navigationId) return;
          if (module.init) module.init(params);
          else if (typeof module.default === 'function') module.default(params);
        })
        .catch(err => console.warn("Script load failed:", err));
    }
  } catch (error) {
    if (currentNavigation !== navigationId) return;
    console.error("Error loading route:", error);
    mainPageEl.innerHTML = `
      <div class="error">
        <h2>Error Loading Page</h2>
        <p>${error.message}</p>
        <p>Path: ${path}</p>
      </div>
    `;
  }
};

// Utility function for programmatic navigation
window.navigateTo = (path, params = {}) => {
  let url = path;
  if (params && Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    url += '?' + queryString;
  }
  window.location.hash = url;
};

// Event listeners
window.addEventListener("hashchange", handleLocation);
document.addEventListener("DOMContentLoaded", handleLocation);

// Make router utilities globally available
window.router = {
  navigateTo: window.navigateTo,
  getCurrentParams: () => window.routeParams || {},
  getCurrentQuery: () => window.routeQuery || {}
};
