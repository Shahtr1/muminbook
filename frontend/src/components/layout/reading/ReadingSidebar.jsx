import { Flex, useTheme } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { FolderTree } from "@/components/layout/reading/FolderTree.jsx";

export const ReadingSidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

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
      w="200px"
      fontSize="sm"
    >
      <FolderTree
        activePath={currentPath}
        onSelect={(path) => navigate(`/reading/${path}`)}
      />
    </Flex>
  );
};
