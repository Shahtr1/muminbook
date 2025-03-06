import { Sidebar } from "@/components/layout/Sidebar.jsx";
import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { featureItems } from "@/components/data/featureItems.js";

export const Features = () => {
  return (
    <Flex width="full" maxW="x-max-width" mx="auto">
      <Sidebar label={"Features"} items={featureItems()} />
      <Box>
        <Outlet />
      </Box>
    </Flex>
  );
};
