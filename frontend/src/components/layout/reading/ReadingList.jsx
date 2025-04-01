import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { Folder } from "@/components/layout/reading/resources/Folder.jsx";
import { readingItems } from "@/data/readingItems.js";
import { ReadingCard } from "@/components/layout/reading/ReadingCard.jsx";
import { useNavigate } from "react-router-dom";
import { useIsMyFilesEmpty } from "@/hooks/resource/useIsMyFilesEmpty.js";
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
  const { emptyMyFiles, isPending, isError } = useIsMyFilesEmpty();

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong />;

  return (
    <Flex gap={gapSize} flexWrap="wrap" px={8} py={2}>
      <Folder
        onClick={() => navigate("my-files")}
        width={itemWidth}
        empty={emptyMyFiles}
        showItemToolbar={false}
      />

      {readingItems().map((item) => (
        <ReadingCard key={item.id} {...item} width={itemWidth} />
      ))}
    </Flex>
  );
};
