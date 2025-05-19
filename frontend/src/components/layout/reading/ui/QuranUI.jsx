import React from "react";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useSurahs } from "@/hooks/quran/useSurahs.js";
import { useCachedQuery } from "@/hooks/useCachedQuery.js";
import { useJuz } from "@/hooks/quran/useJuz.js";
import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { useReadingInfinite } from "@/hooks/reading/useReadings.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { InfiniteScroller } from "@/components/layout/custom/InfiniteScroller.jsx";
import { AyatWithMarker } from "@/components/layout/reading/AyatWithMarker.jsx";

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

  const {
    data,
    isPending: isReadingPending,
    isError: isReadingError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReadingInfinite({ fileId }, { enabled: true });

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const marginX = isSmallScreen ? 1 : 2;

  if (isReadingPending || isSurahsPending || isJuzListPending)
    return <Loader />;
  if (isReadingError || isSurahsError || isJuzListError)
    return <SomethingWentWrong />;

  return (
    <RdWrapperUI fileId={fileId}>
      <Flex gap={1} direction="column" position="relative">
        <Flex flex={1} px={marginX} py={1} direction="column">
          <Box
            fontFamily="ArabicFont"
            whiteSpace="normal"
            wordBreak="break-word"
            textAlign="right"
            dir="rtl"
          >
            <InfiniteScroller
              items={data?.pages.flat() || []}
              renderItem={(item) => <AyatWithMarker item={item} />}
              direction="rtl"
              fontSize="30px"
              onLoadMore={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              isFetching={isFetchingNextPage}
              hasMore={hasNextPage}
            />
          </Box>
        </Flex>
      </Flex>
    </RdWrapperUI>
  );
};
