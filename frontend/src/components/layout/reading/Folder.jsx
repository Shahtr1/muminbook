import { useEffect, useState } from "react";
import { FolderSVG } from "@/components/svgs/FolderSVG.jsx";
import {
  Flex,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";

export const Folder = ({
  onClick,
  width,
  empty = true,
  label = "My Files",
  isFolderView = false,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const dimensions = useBreakpointValue({
    base: "55px",
    sm: isFolderView ? "60px" : "150px",
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const isFolderOpen = location.pathname.includes("/reading/my-files");

  return (
    <Flex
      width={width}
      justify={isSmallScreen ? "start" : "center"}
      align="center"
      flexDirection={isSmallScreen ? "row" : "column"}
      onClick={onClick}
      px={isSmallScreen ? "10px" : 0}
      py={isSmallScreen ? "5px" : 0}
      borderRadius={isSmallScreen ? "lg" : "0"}
      shadow={isSmallScreen ? "md" : "none"}
      bgColor={isSmallScreen ? bgColor : "unset"}
      gap={isSmallScreen ? 5 : "unset"}
      cursor="pointer"
    >
      <FolderSVG dimensions={dimensions} empty={empty} />
      <Tooltip label={label} hasArrow placement="bottom">
        <Text
          fontSize="13px"
          color="brand.500"
          fontWeight="medium"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          maxWidth="100%"
        >
          {label}
        </Text>
      </Tooltip>
    </Flex>
  );
};
