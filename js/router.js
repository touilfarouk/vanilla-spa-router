// Define routes without duplication - use parameterized routes for flexibility
const routes = {
  404: { html: "/pages/404.html", js: null },
  "#/": { html: "/pages/index.html", js: "/js/index.js" },
  "#/about/:id?": { html: "/pages/about.html", js: "/js/about.js" }, // :id? makes id optional
  "#/lorem": { html: "/pages/lorem.html", js: "/js/lorem.js" },
  // Add all your 50+ routes here following the same pattern
  // Use :param? for optional parameters, :param for required ones
};

// Enhanced route matching that handles optional parameters correctly
function matchRoute(path) {
  // Try exact match first for static routes
  if (routes[path]) {
    return { route: routes[path], params: {} };
  }

  // Check all routes for pattern matching
  for (const pattern in routes) {
    if (pattern === "404") continue;
    
    const routeConfig = routes[pattern];
    
    // Skip exact matches we already handled
    if (!pattern.includes(':')) continue;
    
    // Convert route pattern to regex
    const paramNames = [];
    let regexPattern = pattern
      .replace(/\//g, '\\/')
      .replace(/:([^\/]+)\?/g, (_, key) => {
        paramNames.push(key);
        return "(?:/([^\/]*))?"; // Optional parameter with preceding slash
      })
      .replace(/:([^\/]+)/g, (_, key) => {
        paramNames.push(key);
        return "/([^\/]+)"; // Required parameter
      });

    const regex = new RegExp('^' + regexPattern + '$');
    const match = path.match(regex);

    if (match) {
      const params = {};
      paramNames.forEach((name, i) => {
        if (match[i + 1] !== undefined) {
          params[name] = match[i + 1];
        }
      });
      return { route: routeConfig, params };
    }
  }

  return { route: routes[404], params: {} };
}

// Alternative: More robust matching using path analysis
function matchRouteOptimized(path) {
  // Static route exact match
  if (routes[path]) {
    return { route: routes[path], params: {} };
  }

  // Handle parameterized routes
  const pathParts = path.split('/').filter(part => part !== '');
  
  for (const pattern in routes) {
    if (pattern === "404" || !pattern.includes(':')) continue;
    
    const patternParts = pattern.split('/').filter(part => part !== '');
    const routeConfig = routes[pattern];
    const params = {};
    let isMatch = true;

    // Check if path matches pattern structure
    for (let i = 0; i < Math.max(patternParts.length, pathParts.length); i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart && patternPart.startsWith(':')) {
        // This is a parameter
        const paramName = patternPart.replace(':', '').replace('?', '');
        if (pathPart !== undefined) {
          params[paramName] = pathPart;
        } else if (!patternPart.endsWith('?')) {
          // Required parameter is missing
          isMatch = false;
          break;
        }
      } else if (patternPart !== pathPart) {
        // Static parts don't match
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return { route: routeConfig, params };
    }
  }

  return { route: routes[404], params: {} };
}

// Router handler
const handleLocation = async () => {
  const path = window.location.hash || "#/";
  const { route, params } = matchRouteOptimized(path);

  try {
    const html = await fetch(route.html).then(res => res.text());
    document.getElementById("main-page").innerHTML = html;
    
    // Clean up previous scripts
    document.querySelectorAll("script[data-route]").forEach(el => el.remove());
    
    window.routeParams = params;
    
    if (route.js) {
      import(route.js + `?v=${Date.now()}`)
        .then(module => { if (module.init) module.init(params); })
        .catch(err => console.warn("Script load failed:", err));
    }
  } catch (error) {
    console.error("Error loading route:", error);
    document.getElementById("main-page").innerHTML = `
      <div class="error">Error Loading Page: ${error.message}</div>
    `;
  }
};

// Event listeners
window.addEventListener("hashchange", handleLocation);
document.addEventListener("DOMContentLoaded", handleLocation);