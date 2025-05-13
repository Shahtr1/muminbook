import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Flex,
  Spinner,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { useReadingFromPage } from "@/hooks/reading/useReadings.js";
import { useSurahs } from "@/hooks/quran/useSurahs.js";
import { useJuz } from "@/hooks/quran/useJuz.js";
import { useInView } from "react-intersection-observer";
import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";
import { AyatWithMarker } from "@/components/layout/reading/AyatWithMarker.jsx";
import { debounce } from "lodash";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";

export const QuranUI = ({ fileId, selectedSurah }) => {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useReadingFromPage(fileId);

  const {
    surahs,
    isPending: isSurahsPending,
    isError: isSurahsError,
  } = useSurahs();
  const { juz, isPending: isJuzPending, isError: isJuzError } = useJuz();

  const color = useColorModeValue("text.primary", "whiteAlpha.900");
  const bgContentColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const marginX = isSmallScreen ? 1 : 2;

  const scrollRef = useRef(null);
  const hasScrolledToSurah = useRef(false);
  const [isFetching, setIsFetching] = useState(false);

  const { ref: topRef, inView: topInView } = useInView({ threshold: 0.1 });
  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0.1,
  });

  // Reset scroll flag when selectedSurah changes
  useEffect(() => {
    hasScrolledToSurah.current = false;
  }, [selectedSurah?.id]);

  // Scroll to selectedSurah after it's available
  useEffect(() => {
    if (
      !selectedSurah?.id ||
      !data?.pages?.length ||
      hasScrolledToSurah.current
    )
      return;

    const el = document.querySelector(`[data-surah-id='${selectedSurah.id}']`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      hasScrolledToSurah.current = true;
    }
  }, [data?.pages, selectedSurah]);

  // Infinite Scroll handler
  useEffect(() => {
    const fetchData = debounce(async () => {
      if (isFetching) return;
      setIsFetching(true);
      try {
        if (bottomInView && hasNextPage && !isFetchingNextPage) {
          await fetchNextPage();
        } else if (topInView && hasPreviousPage && !isFetchingPreviousPage) {
          await fetchPreviousPage();
        }
      } finally {
        setIsFetching(false);
      }
    }, 300);

    fetchData();
    return () => fetchData.cancel();
  }, [
    bottomInView,
    topInView,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isFetching,
    fetchNextPage,
    fetchPreviousPage,
  ]);

  const getSurahName = useCallback(
    (surahId) => {
      const surah = surahs.find((s) => s.uuid === +surahId);
      return `${surahId}: ${surah?.transliteration || ""}`;
    },
    [surahs],
  );

  const renderedAyat = useMemo(() => {
    let lastJuzId = null;
    return data?.pages.flatMap((pageData, pageIndex) =>
      pageData.data.map((dt) => {
        const isNewJuz = dt.juzId.uuid !== lastJuzId;
        if (isNewJuz) lastJuzId = dt.juzId.uuid;

        return (
          <Box
            as="span"
            key={`${pageIndex}-${dt.uuid}`}
            display="inline"
            data-surah-id={dt.surahId.uuid}
          >
            {dt.surahStart && (
              <SurahHeader rtl surah={dt.surahId} juz={dt.juzId} />
            )}
            <AyatWithMarker data={dt} isNewJuz={isNewJuz} />
          </Box>
        );
      }),
    );
  }, [data?.pages]);

  if (isSurahsPending || isJuzPending) return <Loader />;
  if (isSurahsError || isJuzError) return <SomethingWentWrong />;

  return (
    <RdWrapperUI fileId={fileId} ref={scrollRef}>
      <Flex gap={1} direction="column" position="relative">
        {selectedSurah && (
          <Flex
            mx={marginX}
            mb={1}
            borderBottom="1px solid"
            borderColor={color}
            position="sticky"
            top="0"
            bgColor={bgContentColor}
            zIndex={1}
            justify="space-between"
            px={1}
            fontWeight="600"
          >
            <Text fontSize="12px">
              Starting from Surah {getSurahName(selectedSurah.id)}
            </Text>
            <Text fontSize="12px">Page {selectedSurah.startingPage}</Text>
          </Flex>
        )}

        <Flex flex={1} px={marginX} py={1} direction="column">
          <div ref={topRef} />
          <Box
            fontFamily="ArabicFont"
            whiteSpace="normal"
            wordBreak="break-word"
            textAlign="right"
            dir="rtl"
          >
            {renderedAyat}
            {isFetchingNextPage && <Spinner size="sm" mt={2} />}
            {isFetchingPreviousPage && <Spinner size="sm" mb={2} />}
          </Box>
          <div ref={bottomRef} />
        </Flex>
      </Flex>
    </RdWrapperUI>
  );
};
