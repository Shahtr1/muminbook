import { Flex, Text } from "@chakra-ui/react";

export const ReadingSidebar = () => {
  return (
    <Flex px={8} py={4} bgColor="black" color="white" flexDir="column" gap={2}>
      {Array.from({ length: 50 }, (_, i) => (
        <Text key={i} whiteSpace="nowrap">
          Sidebar {i + 1}
        </Text>
      ))}
    </Flex>
  );
};
