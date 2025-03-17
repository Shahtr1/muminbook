import { FolderSVG } from "@/components/svgs/FolderSVG.jsx";
import { Flex, Text } from "@chakra-ui/react";

export const Folder = () => {
  return (
    <Flex
      height="full"
      width="full"
      justify="center"
      align="center"
      flexDirection="column"
    >
      <FolderSVG dimensions="150px" />
      <Text>My Files</Text>
    </Flex>
  );
};
