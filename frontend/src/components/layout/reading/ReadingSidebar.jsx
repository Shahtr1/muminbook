import { Flex, useColorModeValue, useTheme } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResourcesTree } from "@/components/layout/reading/resources/ResourcesTree.jsx";
import { useIsTrashEmpty } from "@/hooks/resource/useIsTrashEmpty.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { ResourcesTrash } from "@/components/layout/reading/resources/ResourcesTrash.jsx";

export const ReadingSidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.300");

  const navbarHeight = parseInt(theme.space["navbar-height"]);
  const breadcrumbHeight = 40;

  const currentPath =
    location.pathname.replace(/^\/reading\//, "") || "my-files";

  const { emptyTrash, isPending, isError } = useIsTrashEmpty();

  const wrapperWidth = "200px";

  return (
    <Flex
      h={`calc(100vh - ${navbarHeight + breadcrumbHeight}px)`}
      position="sticky"
      top={`calc(${navbarHeight + breadcrumbHeight}px)`}
      minH="100%"
      minW={wrapperWidth}
      maxW={wrapperWidth}
      p={2}
      borderRightWidth="0.1px"
      borderColor={borderColor}
      flexDir="column"
    >
      {isPending && <Loader />}
      {isError && <SomethingWentWrong />}
      {!isPending && !isError && (
        <>
          <ResourcesTrash emptyTrash={emptyTrash} />
          {/*Quick Access and Pinned*/}
          {/*Resource Tree*/}
          <Flex overflowX="auto" py={2}>
            <ResourcesTree
              activePath={currentPath}
              onSelect={(path) => navigate(`/reading/${path}`)}
            />
          </Flex>
        </>
      )}
    </Flex>
  );
};
