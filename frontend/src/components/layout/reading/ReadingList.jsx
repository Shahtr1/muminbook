import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { Folder } from "@/components/layout/reading/Folder.jsx";
import { readingItems } from "@/data/readingItems.js";
import { ReadingCard } from "@/components/layout/reading/ReadingCard.jsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { myFiles } from "@/data/myFiles.js";
import { ReadingIntro } from "@/components/layout/reading/ReadingIntro.jsx";
import { ReadingHeader } from "@/components/layout/reading/ReadingHeader.jsx";

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

  const isFolderOpen = location.pathname.includes("/reading/my-files");

  return (
    <Flex flexDirection="column" py={{ base: 3, sm: 8 }}>
      <ReadingIntro isFolderOpen={isFolderOpen} />
      <ReadingHeader />
      {isFolderOpen ? (
        <Outlet />
      ) : (
        <Flex gap={gapSize} flexWrap="wrap" px={8} py={2}>
          <Folder
            onClick={() => navigate("my-files")}
            width={itemWidth}
            empty={Object.keys(myFiles["my-files"]).length === 0}
          />
          {readingItems().map((item) => (
            <ReadingCard key={item.id} {...item} width={itemWidth} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};
