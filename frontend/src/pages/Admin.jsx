import { Box, Flex, useBreakpointValue, useTheme } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export const Admin = () => {
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
      hi
      {/*<Sidebar label={"Admin"} items={adminItems()} />*/}
      <Box width="full" p={5} overflowY="auto" height="full">
        <Outlet />
      </Box>
    </Flex>
  );
};
