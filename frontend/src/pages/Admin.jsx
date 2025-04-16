import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar/Sidebar.jsx";
import { adminItems } from "@/data/adminItems.js";

export const Admin = () => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  return (
    <Flex
      width="full"
      mx="auto"
      overflowX="hidden"
      flexDirection={isSmallScreen ? "column" : "row"}
    >
      <Sidebar label={"Admin"} items={adminItems()} />
      <Box width="full" p={5} overflowY="auto" height="full">
        <Outlet />
      </Box>
    </Flex>
  );
};
