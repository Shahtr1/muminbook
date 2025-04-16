import { Sidebar } from "@/components/layout/sidebar/Sidebar.jsx";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { featureItems } from "@/data/featureItems.js";

export const Features = () => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  return (
    <Flex
      width="full"
      mx="auto"
      overflowX="hidden"
      flexDirection={isSmallScreen ? "column" : "row"}
    >
      <Sidebar label={"Features"} items={featureItems()} />
      <Box
        width="full"
        p={!isSmallScreen ? 5 : undefined}
        overflowY="auto"
        height="full"
      >
        <Outlet />
      </Box>
    </Flex>
  );
};
