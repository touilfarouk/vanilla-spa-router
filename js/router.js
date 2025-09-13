// Define routes with support for multiple parameters - all about routes go to about.html
const routes = {
  404: { html: "/pages/404.html", js: null },
  "#/": { html: "/pages/index.html", js: "/js/index.js" },
  
  // All about-related routes point to about.html
  "#/about": { html: "/pages/about.html", js: "/js/about.js" },
  "#/about/:id": { html: "/pages/about.html", js: "/js/about.js" },
  "#/about/:userId/post/:postId": { html: "/pages/about.html", js: "/js/about.js" },
  "#/about/:category/:item/:action?": { html: "/pages/about.html", js: "/js/about.js" },
  
  // Other routes
  "#/user/:userId/profile/:section?": { html: "/pages/profile.html", js: "/js/profile.js" },
  "#/category/:categoryId/product/:productId/version/:version?": { 
    html: "/pages/product.html", 
    js: "/js/product.js" 
  },
  "#/lorem": { html: "/pages/lorem.html", js: "/js/lorem.js" },
  // Add all your 50+ routes here
};

// Enhanced route matching with priority-based matching
function matchRoute(path) {
  // Try exact match first for static routes
  if (routes[path]) {
    return { route: routes[path], params: {} };
  }

  // Handle parameterized routes - we need to prioritize more specific patterns
  const pathParts = path.split('/').filter(part => part !== '' && part !== '#');
  let bestMatch = null;
  let bestMatchScore = -1;

  for (const pattern in routes) {
    if (pattern === "404" || !pattern.includes(':')) continue;
    
    const patternParts = pattern.split('/').filter(part => part !== '' && part !== '#');
    const routeConfig = routes[pattern];
    const params = {};
    let isMatch = true;
    let matchScore = 0;

    // Check if path matches pattern structure
    for (let i = 0; i < Math.max(patternParts.length, pathParts.length); i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (!patternPart && !pathPart) {
        continue;
      }

      if (patternPart && patternPart.startsWith(':')) {
        // This is a parameter
        const paramName = patternPart.replace(':', '').replace('?', '');
        if (pathPart !== undefined) {
          params[paramName] = pathPart;
          matchScore++; // Score higher for matching parameters
        } else if (!patternPart.endsWith('?')) {
          isMatch = false;
          break;
        }
      } else if (patternPart !== pathPart) {
        isMatch = false;
        break;
      } else {
        matchScore += 2; // Score even higher for exact static part matches
      }
    }

    if (isMatch && matchScore > bestMatchScore) {
      bestMatch = { route: routeConfig, params };
      bestMatchScore = matchScore;
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  return { route: routes[404], params: {} };
}

// Router handler
const handleLocation = async () => {
  const path = window.location.hash || "#/";
  const { route, params } = matchRoute(path);

  console.log("Navigating to:", path, "Params:", params); // Debug info

  try {
    const html = await fetch(route.html).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${route.html}`);
      return res.text();
    });
    
    document.getElementById("main-page").innerHTML = html;
    
    // Clean up previous scripts
    document.querySelectorAll("script[data-route]").forEach(el => el.remove());
    
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

// Utility function for programmatic navigation with parameters
window.navigateTo = (path, params = {}) => {
  let url = path;
  
  // Replace parameters in the path
  if (params && Object.keys(params).length > 0) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, value).replace(`:${key}?`, value);
    }
  }
  
  window.location.hash = url;
};

// Event listeners
window.addEventListener("hashchange", handleLocation);
document.addEventListener("DOMContentLoaded", handleLocation);