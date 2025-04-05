import {
  Flex,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResourcesTree } from "@/components/layout/reading/resources/ResourcesTree.jsx";
import { ResourcesTrash } from "@/components/layout/reading/resources/ResourcesTrash.jsx";
import { ResourcesOverview } from "@/components/layout/reading/resources/ResourcesOverview.jsx";

export const ReadingSidebar = ({ overview }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.300");
  const navbarHeight = parseInt(theme.space["navbar-height"]);
  const breadcrumbHeight = 40;
  const readingPaddingTop = parseInt(
    useBreakpointValue({
      base: theme.space["reading-layout-padding-top-sm"],
      sm: theme.space["reading-layout-padding-top-lg"],
    }),
  );
  const readingHeaderHeight = parseInt(
    useBreakpointValue({
      base: theme.space["reading-header-sm"],
      sm: theme.space["reading-header-lg"],
    }),
  );

  const currentPath =
    location.pathname.replace(/^\/reading\//, "") || "my-files";

  const wrapperWidth = "200px";

  return (
    <Flex
      h={`calc(100vh - ${navbarHeight + breadcrumbHeight + readingPaddingTop + readingHeaderHeight}px)`}
      position="sticky"
      top={`calc(${navbarHeight + breadcrumbHeight}px)`}
      minH={`calc(100vh - ${navbarHeight + breadcrumbHeight + readingPaddingTop + readingHeaderHeight}px)`}
      minW={wrapperWidth}
      maxW={wrapperWidth}
      p={2}
      borderRightWidth="0.1px"
      borderColor={borderColor}
      flexDir="column"
      zIndex={1}
    >
      <>
        <ResourcesTrash />
        {/*Quick Access and Pinned*/}
        <ResourcesOverview overview={overview} />
        {/*Resource Tree*/}
        <Flex overflow="auto" py={2}>
          <ResourcesTree
            activePath={currentPath}
            onSelect={(path) => navigate(`/reading/${path}`)}
          />
        </Flex>
      </>
    </Flex>
  );
};
