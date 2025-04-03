import { Outlet, useLocation } from "react-router-dom";
import { ReadingHeader } from "@/components/layout/reading/ReadingHeader.jsx";
import { ReadingToolbar } from "@/components/layout/reading/toolbar/ReadingToolbar.jsx";
import { ReadingSidebar } from "@/components/layout/reading/ReadingSidebar.jsx";
import { Flex } from "@chakra-ui/react";

export const ReadingLayout = () => {
  const location = useLocation();
  const isFolderView =
    location.pathname.includes("/reading/my-files") ||
    location.pathname.includes("/reading/trash");

  return (
    <Flex
      flexDirection="column"
      pt={{
        base: "reading-layout-padding-top-sm",
        sm: "reading-layout-padding-top-lg",
      }}
      w="full"
    >
      <ReadingHeader isFolderView={isFolderView} />
      <ReadingToolbar />
      <Flex h="100%">
        {isFolderView && <ReadingSidebar />}
        <Outlet />
      </Flex>
    </Flex>
  );
};
