import React from "react";
import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { useSurahs } from "@/hooks/quran/useSurahs.js";
import { useCachedQuery } from "@/hooks/useCachedQuery.js";
import { useJuz } from "@/hooks/quran/useJuz.js";
import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { useReadingInfinite } from "@/hooks/reading/useReadings.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { QuranReader } from "@/components/layout/reading/ui/QuranReader.jsx";

export const QuranUI = ({ fileId }) => {
  const {
    data: surahs,
    isPending: isSurahsPending,
    isError: isSurahsError,
  } = useCachedQuery(["surahs"], useSurahs);

  const {
    data: juzList,
    isPending: isJuzListPending,
    isError: isJuzListError,
  } = useCachedQuery(["juzList"], useJuz);

  const startValue = 1;

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isPending: isReadingPending,
    isError: isReadingError,
  } = useReadingInfinite({
    fileId: "quran",
    startType: "surah",
    startValue: startValue,
    limit: 50,
  });

  const flatData = data?.pages.flatMap((page) => page.data);

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const marginX = isSmallScreen ? 1 : 2;

  if (isReadingPending || isSurahsPending || isJuzListPending)
    return <Loader />;
  if (isReadingError || isSurahsError || isJuzListError)
    return <SomethingWentWrong />;

  return (
    <RdWrapperUI fileId={fileId}>
      <Flex flex={1} gap={1} direction="column" position="relative">
        <Flex flex={1} px={marginX} direction="column">
          <QuranReader
            chunks={flatData}
            fetchNextChunk={fetchNextPage}
            fetchPreviousChunk={fetchPreviousPage}
          />
        </Flex>
      </Flex>
    </RdWrapperUI>
  );
};
