import { Flex, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

export const FolderView = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter(Boolean);
  const myFilesIndex = pathnames.indexOf("my-files");
  const folderPath = pathnames.slice(myFilesIndex + 1);

  return (
    <Flex flexDirection="column" px={8} py={4}>
      <Text fontWeight="bold" mb={2}>
        Current Folder:
      </Text>
      <Text fontSize="lg" color="brand.500">
        {folderPath.length > 0 ? folderPath.join(" / ") : "My Files"}
      </Text>
    </Flex>
  );
};
