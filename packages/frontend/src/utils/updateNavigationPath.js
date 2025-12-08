let previousPathname = null;
let currentPathname = null;

export const updateNavigationPath = (nextPathname) => {
  if (!nextPathname.startsWith("/suhuf")) {
    previousPathname = nextPathname;
  }
  currentPathname = nextPathname;
};

export const getPreviousNonWindowPath = () => previousPathname || "/";
