import { Flex } from "@chakra-ui/react";

export const ReadingSidebar = ({ show = true }) => {
  return <>{show && <Flex>Sidebar</Flex>}</>;
};
