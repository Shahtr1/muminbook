import {
  Box,
  Flex,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { BsFiles, BsSearch } from "react-icons/bs";

export const EditorLeftSidebar = () => {
  const iconActiveColor = useColorModeValue("wn.bold.light", "wn.bold.dark");
  const iconColor = useColorModeValue("wn.icon.light", "wn.icon.dark");
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");

  return (
    <Flex w="40px" bg="gray.900" color="white" py={5} bgColor={bgColor}>
      <VStack spacing={5} align="center" w="100%">
        <Tooltip variant="inverted" label="My Files" placement="right">
          <Box
            color={iconColor}
            _hover={{ color: iconActiveColor }}
            cursor="pointer"
          >
            <BsFiles size="20px" />
          </Box>
        </Tooltip>
        <Tooltip variant="inverted" label="Search My Files" placement="right">
          <Box
            color={iconColor}
            _hover={{ color: iconActiveColor }}
            cursor="pointer"
          >
            <BsSearch size="20px" />
          </Box>
        </Tooltip>
      </VStack>
    </Flex>
  );
};
