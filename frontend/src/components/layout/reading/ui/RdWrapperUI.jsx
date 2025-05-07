import { Flex } from "@chakra-ui/react";
import { RdWrapperSidebar } from "@/components/layout/reading/ui/wrapper/RdWrapperSidebar.jsx";
import { RdWrapperToolbar } from "@/components/layout/reading/ui/wrapper/RdWrapperToolbar.jsx";

export const RdWrapperUI = ({ fileId, children }) => {
  return (
    <Flex h="100%" w="100%">
      <RdWrapperSidebar fileId={fileId} />
      <Flex flex={1}>{children}</Flex>
      <RdWrapperToolbar />
    </Flex>
  );
};
