import { Box, IconButton, VStack } from "@chakra-ui/react";
import { FiFileText, FiSearch, FiUsers } from "react-icons/fi";

export const EditorLeftSidebar = () => {
  return (
    <Box w="60px" bg="gray.900" color="white" py={4}>
      <VStack spacing={4}>
        <IconButton icon={<FiFileText />} aria-label="Files" variant="ghost" />
        <IconButton icon={<FiSearch />} aria-label="Search" variant="ghost" />
        <IconButton icon={<FiUsers />} aria-label="Community" variant="ghost" />
      </VStack>
    </Box>
  );
};
