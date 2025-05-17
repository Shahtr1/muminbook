import React, { useEffect, useMemo, useRef } from "react";
import { Box, Flex, Spinner, useBreakpointValue } from "@chakra-ui/react";
import { useSurahs } from "@/hooks/quran/useSurahs.js";
import { useJuz } from "@/hooks/quran/useJuz.js";
import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { useReadingInfinite } from "@/hooks/reading/useReadings.js";
import { AyatWithMarker } from "@/components/layout/reading/AyatWithMarker.jsx";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";

export const QuranUI = ({
  fileId,
  surahId = null,
  juzId = null,
  ruku = null,
  hizbQuarter = null,
}) => {
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
  } = useReadingInfinite(
    { fileId, surahId, juzId, ruku, hizbQuarter },
    { enabled: true },
  );

  const loadMoreRef = useRef();
  const quranUiRef = useRef();

  // Automatically load next chunk if screen is short
  useEffect(() => {
    requestAnimationFrame(() => {
      const { innerHeight } = window;
      const uiHeight = quranUiRef?.current?.offsetHeight;
      if (uiHeight <= innerHeight && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
  }, [data, hasNextPage, isFetchingNextPage]);

  // IntersectionObserver for lazy scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchNextPage();
    });

    const ref = loadMoreRef.current;
    observer.observe(ref);

    return () => observer.unobserve(ref);
  }, [fetchNextPage, hasNextPage]);

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const marginX = isSmallScreen ? 1 : 2;

  // Render ayahs with Surah & Juz headers
  const renderedAyat = useMemo(() => {
    let lastJuzId = null;
    return data?.pages.flat().map((dt) => {
      const surah = surahs.find((s) => s._id === dt.surahId);
      const juz = juzList.find((j) => j._id === dt.juzId);
      if (!surah || !juz) return null;

      const isNewJuz = juz.uuid !== lastJuzId;
      if (isNewJuz) lastJuzId = juz.uuid;

      return (
        <Box as="span" key={dt.uuid} display="inline">
          {dt.surahStart && <SurahHeader rtl surah={surah} juz={juz} />}
          <AyatWithMarker
            data={dt}
            isNewJuz={isNewJuz}
            surahId={surah.uuid}
            juzId={juz.uuid}
          />
        </Box>
      );
    });
  }, [surahs, juzList, data?.pages]);

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
              {renderedAyat}
              {hasNextPage && (
                <Box
                  as="span"
                  display="inline"
                  ref={loadMoreRef}
                  textAlign="center"
                  py={4}
                >
                  <Spinner size="sm" />
                </Box>
              )}
            </>
          </Box>
        </Flex>
      </Flex>
    </RdWrapperUI>
  );
};
