import { Sidebar } from "@/components/layout/Sidebar.jsx";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { featureItems } from "@/components/data/featureItems.js";

export const Features = () => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  return (
    <Flex
      width="full"
      maxW="x-max-width"
      mx="auto"
      overflowX="hidden"
      flexDirection={isSmallScreen && "column"}
    >
      <Sidebar label={"Features"} items={featureItems()} />
      <Box>
        <Outlet />
      </Box>
    </Flex>
  );
};
