const common_spacings = {
  "navbar-height": "52px",
  "reading-layout-padding-top-sm": "12px",
  "reading-layout-padding-top-lg": "32px",
  "reading-header-sm": "50px",
  "reading-header-lg": "60px",
  "sidebar-width": "200px",
  "win-manager-height": "25px",
};

const spacings = {
  sizes: {
    // Use values inside `sizes` when applying to:
    // - `h` (height), `maxH` (max-height), `w` (width), `maxW` (max-width)
    // Example usage: <Box h="navbar-height" />
    ...common_spacings,
    "x-max-width": "1000px",
  },
  space: {
    // Use values inside `space` when applying to:
    // - `p` (padding), `px` (padding-x), `py` (padding-y)
    // - `m` (margin), `mx` (margin-x), `my` (margin-y)
    // Example usage: <Box p="navbar-height" />
    ...common_spacings,
    "x-pad-5": "5px",
    "x-pad-10": "10px",
    "x-pad-20": "20px",
  },
};

export default spacings;
