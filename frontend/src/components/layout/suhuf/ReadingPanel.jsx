import { Flex, useColorModeValue } from "@chakra-ui/react";

export const ReadingPanel = () => {
  const bgColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  return (
    <Flex height="100%" overflowY="auto" bgColor={bgColor} flexDir="column">
      Reading Panel
    </Flex>
  );
};
