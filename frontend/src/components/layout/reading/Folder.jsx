import { useEffect, useState } from "react";
import { FolderSVG } from "@/components/svgs/FolderSVG.jsx";
import {
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";

export const Folder = ({ onClick, width, empty = true }) => {
  const bgColor = useColorModeValue("white", "gray.800");

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Flex
      h={isSmallScreen ? "90px" : "full"}
      width={width}
      justify={isSmallScreen ? "start" : "center"}
      align="center"
      flexDirection={isSmallScreen ? "row" : "column"}
      onClick={onClick}
      px={isSmallScreen ? "10px" : 0}
      borderRadius={isSmallScreen ? "lg" : "0"}
      shadow={isSmallScreen ? "md" : "none"}
      bgColor={isSmallScreen ? bgColor : "unset"}
      gap={isSmallScreen ? 5 : "unset"}
      cursor="pointer"
    >
      <FolderSVG dimensions={isSmallScreen ? "55px" : "150px"} empty={empty} />
      <Text fontSize="15px" color="brand.500" fontWeight="bold">
        My Files
      </Text>
    </Flex>
  );
};
