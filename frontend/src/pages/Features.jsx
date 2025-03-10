import { Sidebar } from "@/components/layout/Sidebar.jsx";
import { Box, Flex, useBreakpointValue, useTheme } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { featureItems } from "@/data/featureItems.js";

export const Features = () => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const theme = useTheme();
  return (
    <Flex
      width="full"
      mx="auto"
      overflowX="hidden"
      flexDirection={isSmallScreen && "column"}
      h={`calc(100vh - ${theme.sizes["navbar-height"]})`}
    >
      <Sidebar label={"Features"} items={featureItems()} />
      <Box width="full" p={!isSmallScreen && 5} overflowY="auto" height="full">
        <Outlet />
      </Box>
    </Flex>
  );
};
