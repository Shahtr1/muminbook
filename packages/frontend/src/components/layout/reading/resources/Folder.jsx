import { useEffect, useState } from "react";
import { FolderSVG } from "@/components/svgs/FolderSVG.jsx";
import {
  Flex,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { ItemToolbar } from "@/components/layout/reading/toolbar/ItemToolbar.jsx";
import { ResourcesActionItems } from "@/components/layout/reading/resources/ResourcesActionItems.jsx";
import { useAccessTracker } from "@/hooks/resource/useAccessTracker.js";

export const Folder = ({ onClick, width, folderPath, resource }) => {
  const { updateAccessedAt } = useAccessTracker();
  const { id, name = "My Files", empty = true } = resource;
  const lostAndFound = resource.name === "lost+found";
  const myFiles = resource.name === "my-files" || !resource.name;
  const showItemToolbar = !lostAndFound && !myFiles;

  const isTrashView = location.pathname.includes("/reading/trash");
  const isFolderView =
    location.pathname.includes("/reading/my-files") || isTrashView;

  const bgColor = useColorModeValue("white", "gray.800");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const dimensions = useBreakpointValue({
    base: "40px",
    sm: isFolderView ? "60px" : "150px",
  });

  const [hasMounted, setHasMounted] = useState(false);

  const handleClick = () => {
    if (!lostAndFound && !myFiles && !isTrashView) updateAccessedAt(id);
    onClick();
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Flex
      width={width}
      align="center"
      justify="center"
      px={isSmallScreen && !isFolderView ? "10px" : 0}
      py={isSmallScreen && !isFolderView ? "5px" : 0}
      borderRadius={isSmallScreen && !isFolderView ? "lg" : "0"}
      shadow={isSmallScreen && !isFolderView ? "md" : "none"}
      bgColor={isSmallScreen && !isFolderView ? bgColor : "unset"}
      cursor="pointer"
      position="relative"
    >
      {showItemToolbar && (
        <ItemToolbar
          right={isSmallScreen ? "-5px" : "5px"}
          children={
            <ResourcesActionItems
              resource={resource}
              pathFromUrl={folderPath}
            />
          }
        />
      )}
      <Flex
        width="100%"
        justify={isSmallScreen && !isFolderView ? "start" : "center"}
        align="center"
        flexDirection={isSmallScreen && !isFolderView ? "row" : "column"}
        onClick={handleClick}
        gap={isSmallScreen && !isFolderView ? 5 : "unset"}
        overflow="hidden"
      >
        <FolderSVG dimensions={dimensions} empty={empty} />
        <Tooltip label={name} hasArrow placement="bottom">
          <Text
            fontSize={
              isFolderView
                ? { base: "10px", sm: "13px" }
                : { base: "13px", sm: "15px" }
            }
            color="brand.500"
            fontWeight={isFolderView ? "medium" : "bold"}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            maxWidth="100%"
          >
            {name}
          </Text>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
