import { FolderSVG } from "@/components/svgs/FolderSVG.jsx";
import { Flex, Text } from "@chakra-ui/react";

export const Folder = ({ onClick, empty = true }) => {
  return (
    <Flex
      height="full"
      width="full"
      justify="center"
      align="center"
      flexDirection="column"
      onClick={onClick}
    >
      <FolderSVG dimensions="150px" empty={empty} />
      <Text fontSize={{ base: "12px", sm: "14px" }}>My Files</Text>
    </Flex>
  );
};
