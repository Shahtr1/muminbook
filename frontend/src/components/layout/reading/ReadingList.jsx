import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { Folder } from "@/components/layout/reading/Folder.jsx";
import { readingItems } from "@/data/readingItems.js";
import { ReadingCard } from "@/components/layout/reading/ReadingCard.jsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ReadingHeader } from "@/components/layout/reading/ReadingHeader.jsx";
import { ReadingToolbar } from "@/components/layout/reading/toolbar/ReadingToolbar.jsx";
import { ReadingSidebar } from "@/components/layout/reading/ReadingSidebar.jsx";
import { useIsMyFilesEmpty } from "@/hooks/useIsMyFilesEmpty.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";

export const ReadingList = () => {
  const gapSize = "25px";
  const itemWidth = useBreakpointValue({
    base: `100%`,
    sm: `calc(50% - ${gapSize})`,
    md: `calc(33.33% - ${gapSize})`,
    lg: `calc(25% - ${gapSize})`,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { emptyMyFiles, isPending, isError } = useIsMyFilesEmpty();

  if (isPending) return <Loader />;

  if (isError) return <SomethingWentWrong />;

  const isFolderView = location.pathname.includes("/reading/my-files");

  return (
    <Flex flexDirection="column" pt={{ base: 3, sm: 8 }} w="full">
      <ReadingHeader isFolderView={isFolderView} />
      <ReadingToolbar />
      {isFolderView ? (
        <Flex h="100%">
          <ReadingSidebar />
          <Outlet />
        </Flex>
      ) : (
        <Flex gap={gapSize} flexWrap="wrap" px={8} py={2}>
          <Folder
            onClick={() => navigate("my-files")}
            width={itemWidth}
            empty={emptyMyFiles}
          />
          {readingItems().map((item) => (
            <ReadingCard key={item.id} {...item} width={itemWidth} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};
