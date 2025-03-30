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
      flexDir="column"
      h={`calc(100vh - ${navbarHeight + breadcrumbHeight}px)`}
      overflowY="auto"
      position="sticky"
      top={`calc(${navbarHeight + breadcrumbHeight}px)`}
      minW="220px"
      maxW="220px"
      fontSize="sm"
      px={2}
      borderRightWidth="0.1px"
      borderColor={borderColor}
    >
      <ResourcesTree
        activePath={currentPath}
        onSelect={(path) => navigate(`/reading/${path}`)}
      />
    </Flex>
  );
};
