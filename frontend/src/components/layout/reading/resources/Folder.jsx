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
import { ResourcesToolbar } from "@/components/layout/reading/resources/ResourcesToolbar.jsx";

export const Folder = ({
  onClick,
  width,
  empty = true,
  label = "My Files",
  isFavourite = false,
  showItemToolbar = true,
}) => {
  const isFolderView =
    location.pathname.includes("/reading/my-files") ||
    location.pathname.includes("/reading/trash");

  const bgColor = useColorModeValue("white", "gray.800");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const dimensions = useBreakpointValue({
    base: "40px",
    sm: isFolderView ? "60px" : "150px",
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Flex
      width={width}
      align="center"
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
          isFavourite={isFavourite}
          zIndex="99999"
          children={<ResourcesToolbar />}
        />
      )}
      <Flex
        width="100%"
        justify={isSmallScreen && !isFolderView ? "start" : "center"}
        align="center"
        flexDirection={isSmallScreen && !isFolderView ? "row" : "column"}
        onClick={onClick}
        gap={isSmallScreen && !isFolderView ? 5 : "unset"}
        overflow="hidden"
      >
        <FolderSVG dimensions={dimensions} empty={empty} />
        <Tooltip label={label} hasArrow placement="bottom">
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
            {label}
          </Text>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
