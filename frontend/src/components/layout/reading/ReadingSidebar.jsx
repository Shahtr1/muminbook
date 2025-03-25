import { Flex, Text, useTheme } from "@chakra-ui/react";

export const ReadingSidebar = () => {
  const theme = useTheme();
  const navbarHeight = parseInt(theme.space["navbar-height"]);
  const breadcrumbHeight = 40;

  return (
    <Flex
      px={8}
      py={4}
      bgColor="black"
      color="white"
      flexDir="column"
      gap={2}
      h={`calc(100vh - ${navbarHeight + breadcrumbHeight}px)`}
      overflowY="auto"
      position="sticky"
      top={`calc(${navbarHeight + breadcrumbHeight}px)`}
      w="40vw"
    >
      {Array.from({ length: 50 }, (_, i) => (
        <Text key={i} whiteSpace="nowrap">
          Sidebar {i + 1}
        </Text>
      ))}
    </Flex>
  );
};
