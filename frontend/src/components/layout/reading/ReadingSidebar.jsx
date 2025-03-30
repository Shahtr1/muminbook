import { Flex, useColorModeValue, useTheme } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResourcesTree } from "@/components/layout/reading/resources/ResourcesTree.jsx";

export const ReadingSidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.300");

  const navbarHeight = parseInt(theme.space["navbar-height"]);
  const breadcrumbHeight = 40;

  const currentPath =
    location.pathname.replace(/^\/reading\//, "") || "my-files";

  return (
    <Flex
      h={`calc(100vh - ${navbarHeight + breadcrumbHeight}px)`}
      position="sticky"
      top={`calc(${navbarHeight + breadcrumbHeight}px)`}
      minH="100%"
      minW="200px"
      maxW="200px"
      px={2}
      borderRightWidth="0.1px"
      borderColor={borderColor}
      flexDir="column"
    >
      {/*Quick Access and Pinned*/}
      {/*Resource Tree*/}
      <Flex overflowX="auto">
        <ResourcesTree
          activePath={currentPath}
          onSelect={(path) => navigate(`/reading/${path}`)}
        />
      </Flex>
    </Flex>
  );
};
