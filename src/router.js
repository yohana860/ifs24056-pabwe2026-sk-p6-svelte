import { writable, derived } from "svelte/store";

function normalizePath(path) {
  if (!path) return "/";
  // Hapus trailing slash kecuali untuk root
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

export const currentPath = writable(
  normalizePath(typeof window !== "undefined" ? window.location.pathname : "/")
);

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    currentPath.set(normalizePath(window.location.pathname));
  });
}

export function navigate(to, options = {}) {
  const normalized = normalizePath(to);
  if (options.replace) {
    window.history.replaceState({}, "", normalized);
  } else {
    window.history.pushState({}, "", normalized);
  }
  currentPath.set(normalized);
}

export const router = {
  push: (to) => navigate(to),
  replace: (to) => navigate(to, { replace: true }),
};

export const routes = [
  { pattern: "/auth/login", name: "login", layout: "auth" },
  { pattern: "/auth/register", name: "register", layout: "auth" },
  { pattern: "/", name: "home", layout: "linktree" },
  { pattern: "/users", name: "users", layout: "linktree" },
  { pattern: "/profile", name: "profile", layout: "linktree" },
  { pattern: "/link-trees/:linkTreeId", name: "linktree-detail", layout: "linktree" },
];

export function matchPath(pattern, path) {
  const cleanPath = normalizePath(path);
  const cleanPattern = normalizePath(pattern);

  if (cleanPattern === cleanPath) {
    return { matches: true, params: {} };
  }

  const patternSegments = cleanPattern.split("/").filter(Boolean);
  const pathSegments = cleanPath.split("/").filter(Boolean);

  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternSegments.length; i++) {
    const pSeg = patternSegments[i];
    const aSeg = pathSegments[i];

    if (pSeg.startsWith(":")) {
      params[pSeg.slice(1)] = aSeg;
    } else if (pSeg !== aSeg) {
      return null;
    }
  }

  return { matches: true, params };
}

export function resolveRoute(path, routesList = routes) {
  const cleanPath = normalizePath(path);
  for (const route of routesList) {
    const match = matchPath(route.pattern, cleanPath);
    if (match) {
      return {
        name: route.name,
        path: cleanPath,
        params: match.params,
        layout: route.layout,
      };
    }
  }

  return {
    name: "not-found",
    path: cleanPath,
    params: {},
    layout: "none",
  };
}

export const currentRoute = derived(currentPath, ($path) => resolveRoute($path));

export default router;