import {
  Flex,
  IconButton,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResourcesTree } from "@/components/layout/reading/resources/ResourcesTree.jsx";
import { ResourcesTrash } from "@/components/layout/reading/resources/ResourcesTrash.jsx";
import { ResourcesOverview } from "@/components/layout/reading/resources/ResourcesOverview.jsx";
import { LuMenu } from "react-icons/lu";
import { useState } from "react";

export const ReadingSidebar = ({ overview }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.300");

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const navbarHeight = parseInt(theme.space["navbar-height"]);
  const breadcrumbHeight = 40;

  const readingPaddingTop = parseInt(
    useBreakpointValue({
      base: theme.space["reading-layout-padding-top-sm"],
      sm: theme.space["reading-layout-padding-top-lg"],
    }) || 0,
  );

  const readingHeaderHeight = parseInt(
    useBreakpointValue({
      base: theme.space["reading-header-sm"],
      sm: theme.space["reading-header-lg"],
    }) || 0,
  );

  const sidebarWidth = theme.space["sidebar-width"];
  const currentPath =
    location.pathname.replace(/^\/reading\//, "") || "my-files";

  return (
    <>
      {/* Toggle Button - floats on left side of the page */}
      <IconButton
        icon={<LuMenu fontSize="20px" />}
        aria-label="Toggle Sidebar"
        onClick={toggleSidebar}
        position="fixed"
        left={isSidebarOpen ? sidebarWidth : "5px"}
        zIndex={10}
        size="xs"
        variant="ghost"
        borderRadius="sm"
      />

      <Flex
        h={`calc(100vh - ${
          navbarHeight +
          breadcrumbHeight +
          readingPaddingTop +
          readingHeaderHeight
        }px)`}
        position="sticky"
        top={`${navbarHeight + breadcrumbHeight}px`}
        minH={`calc(100vh - ${
          navbarHeight +
          breadcrumbHeight +
          readingPaddingTop +
          readingHeaderHeight
        }px)`}
        w={sidebarWidth}
        minW={sidebarWidth}
        maxW={sidebarWidth}
        p={2}
        borderRightWidth="1px"
        borderColor={borderColor}
        flexDir="column"
        zIndex={1}
        gap={2}
        ml={isSidebarOpen ? 0 : `-${sidebarWidth}`}
        transition="margin-left 0.3s ease-in-out"
      >
        <ResourcesTrash />
        <ResourcesOverview overview={overview} />
        <Flex overflow="auto" py={1}>
          <ResourcesTree
            activePath={currentPath}
            onSelect={(path) => navigate(`/reading/${path}`)}
          />
        </Flex>
      </Flex>
    </>
  );
};
