import React, { useEffect, useRef } from "react";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useSurahs } from "@/hooks/quran/useSurahs.js";
import { useJuz } from "@/hooks/quran/useJuz.js";
import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { useReadingInfinite } from "@/hooks/reading/useReadings.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { VirtualScroller } from "@/components/layout/custom/VirtualScroller.jsx";

export const QuranUI = ({ fileId }) => {
  const {
    surahs,
    isPending: isSurahsPending,
    isError: isSurahsError,
  } = useSurahs();
  const { juzList, isPending: isJuzPending, isError: isJuzError } = useJuz();

  const {
    data,
    isPending: isReadingPending,
    isError: isReadingError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReadingInfinite({ fileId }, { enabled: true });

  const loadMoreRef = useRef();
  const quranUiRef = useRef();

  // Automatically load next chunk if screen is short
  // useEffect(() => {
  //   requestAnimationFrame(() => {
  //     const { innerHeight } = window;
  //     const uiHeight = quranUiRef?.current?.offsetHeight;
  //     if (uiHeight <= innerHeight && hasNextPage && !isFetchingNextPage) {
  //       fetchNextPage();
  //     }
  //   });
  // }, [data, hasNextPage, isFetchingNextPage]);

  // IntersectionObserver for lazy scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      console.log("entry.isIntersecting", entry.isIntersecting);
      if (entry.isIntersecting) fetchNextPage();
    });

    const ref = loadMoreRef.current;
    observer.observe(ref);

    return () => observer.unobserve(ref);
  }, [fetchNextPage, hasNextPage]);

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const marginX = isSmallScreen ? 1 : 2;

  if (isReadingPending || isSurahsPending || isJuzPending) return <Loader />;
  if (isReadingError || isSurahsError || isJuzError)
    return <SomethingWentWrong />;

  return (
    <RdWrapperUI fileId={fileId}>
      <Flex ref={quranUiRef} gap={1} direction="column" position="relative">
        <Flex flex={1} px={marginX} py={1} direction="column">
          <Box
            fontFamily="ArabicFont"
            whiteSpace="normal"
            wordBreak="break-word"
            textAlign="right"
            dir="rtl"
          >
            <>
              <VirtualScroller
                items={data?.pages.flat() || []}
                renderItem={(item) => `${item.ayat} `}
                direction="rtl"
                fontSize="30px"
              />
            </>
          </Box>
        </Flex>
      </Flex>
    </RdWrapperUI>
  );
};
