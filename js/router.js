// router.js - Universal Dynamic Router (PURE)
const routes = {
  404: { html: "/pages/404.html", js: null },
  "#/": { html: "/pages/index.html", js: "/js/index.js" },
  "#/about": { html: "/pages/about.html", js: "/js/about.js" },
  "#/lorem": { html: "/pages/lorem.html", js: "/js/lorem.js" },
  // Add all your 50+ base routes here
};

// Dynamic route matching - handles any number of parameters automatically
function matchRoute(path) {
  // Try exact match first for static routes
  if (routes[path]) {
    return { route: routes[path], params: {} };
  }

  // Extract base path (remove parameters)
  const basePath = extractBasePath(path);
  
  // Check if base path exists in routes
  if (routes[basePath]) {
    const routeConfig = routes[basePath];
    const params = extractDynamicParams(path, basePath);
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
function detectParamType(value) {
  if (!value) return value;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  return decodeURIComponent(value);
}

// Router handler
const handleLocation = async () => {
  const path = window.location.hash || "#/";
  const { route, params } = matchRoute(path);

  console.log("🌐 Navigating to:", path, "Parameters:", params);

  try {
    const html = await fetch(route.html).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${route.html}`);
      return res.text();
    });
    
    document.getElementById("main-page").innerHTML = html;
    document.querySelectorAll("script[data-route]").forEach(el => el.remove());
    
    // PURE UNIVERSAL ROUTER - No route-specific logic here!
    window.routeParams = params;
    
    if (route.js) {
      import(route.js + `?v=${Date.now()}`)
        .then(module => { 
          if (module.init) module.init(params);
          else if (typeof module.default === 'function') module.default(params);
        })
        .catch(err => console.warn("Script load failed:", err));
    }
  } catch (error) {
    console.error("Error loading route:", error);
    document.getElementById("main-page").innerHTML = `
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
  navigateTo,
  getCurrentParams: () => window.routeParams || {}
};