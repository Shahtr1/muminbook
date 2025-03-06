import { Outlet } from "react-router-dom";
import { Box, Text } from "@chakra-ui/react";

export const Features = () => {
  return (
    <Box h="100%">
      <Text>Features</Text>
      <Outlet />
    </Box>
  );
};
