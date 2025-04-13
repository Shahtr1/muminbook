import { useBreakpointValue, useTheme } from "@chakra-ui/react";

export const useReadingLayoutConfig = () => {
  const theme = useTheme();

  const navbarHeight = parseInt(theme.space["navbar-height"]);
  const breadcrumbHeight = 40;

  const readingPaddingTop = parseInt(
    useBreakpointValue({
      base: theme.space["reading-layout-padding-top-sm"],
      sm: theme.space["reading-layout-padding-top-lg"],
    }) || "0",
  );

  const readingHeaderHeight = parseInt(
    useBreakpointValue({
      base: theme.space["reading-header-sm"],
      sm: theme.space["reading-header-lg"],
    }) || "0",
  );

  const totalHeaderOffset =
    navbarHeight + breadcrumbHeight + readingPaddingTop + readingHeaderHeight;

  const sidebarWidth = theme.space["sidebar-width"];

  return {
    navbarHeight,
    breadcrumbHeight,
    readingPaddingTop,
    readingHeaderHeight,
    totalHeaderOffset,
    sidebarWidth,
  };
};
