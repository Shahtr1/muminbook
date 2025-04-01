import { Flex, Text, useColorModeValue, useTheme } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResourcesTree } from "@/components/layout/reading/resources/ResourcesTree.jsx";
import { TrashSVG } from "@/components/svgs/TrashSVG.jsx";
import { useIsTrashEmpty } from "@/hooks/useIsTrashEmpty.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";

export const ReadingSidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.300");
  const defaultTextColor = useColorModeValue("text.primary", "whiteAlpha.900");

  const navbarHeight = parseInt(theme.space["navbar-height"]);
  const breadcrumbHeight = 40;

  const currentPath =
    location.pathname.replace(/^\/reading\//, "") || "my-files";

  const isTrashView = location.pathname.includes("/reading/trash");

  const { emptyTrash, isPending, isError } = useIsTrashEmpty();

  const wrapperWidth = "200px";

  if (isPending) return <Loader width={wrapperWidth} />;
  if (isError) return <SomethingWentWrong width={wrapperWidth} />;

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
      <Flex
        w="100%"
        justify="center"
        align="center"
        gap={5}
        cursor="pointer"
        role="group"
        onClick={() => navigate("trash")}
      >
        <Text
          fontSize="14px"
          _groupHover={{ color: isTrashView ? "brand.500" : "brand.600" }}
          color={isTrashView ? "brand.500" : defaultTextColor}
        >
          Trash
        </Text>
        <TrashSVG dimensions="50px" empty={emptyTrash} />
      </Flex>
      {/*Quick Access and Pinned*/}
      {/*Resource Tree*/}
      <Flex overflowX="auto" py={2}>
        <ResourcesTree
          activePath={currentPath}
          onSelect={(path) => navigate(`/reading/${path}`)}
        />
      </Flex>
    </Flex>
  );
};
