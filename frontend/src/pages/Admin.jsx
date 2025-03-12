import { Box, Flex, useBreakpointValue, useTheme } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar/Sidebar.jsx";
import { adminItems } from "@/data/adminItems.js";

export const Admin = () => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const theme = useTheme();
  return (
    <Flex
      width="full"
      mx="auto"
      overflowX="hidden"
      flexDirection={isSmallScreen ? "column" : "row"}
      h={`calc(100vh - ${theme.sizes["navbar-height"]})`}
    >
      <Sidebar label={"Admin"} items={adminItems()} />
      <Box width="full" p={5} overflowY="auto" height="full">
        <Outlet />
      </Box>
    </Flex>
  );
};
