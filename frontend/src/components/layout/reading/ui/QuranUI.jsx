import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";
import { AyatWithMarker } from "@/components/layout/reading/AyatWithMarker.jsx";
import debounce from "lodash/debounce";
import { useSurahs } from "@/hooks/quran/useSurahs.js";
import { useJuz } from "@/hooks/quran/useJuz.js";

export const QuranUI = ({ fileId, page }) => {
  const { data: ayatData } = page;
  const { surahs } = useSurahs();
  const { juz } = useJuz();
  const color = useColorModeValue("text.primary", "whiteAlpha.900");
  const bgContentColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const marginX = isSmallScreen ? 1 : 2;

  const scrollRef = useRef(null);
  const queryClient = useQueryClient();
  const [topAyat, setTopAyat] = useState(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleScroll = debounce(() => {
      const elements = scrollEl.querySelectorAll("[id^='ayat-']");
      let closest = null,
        minDist = Infinity;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top);
        if (rect.top >= 0 && dist < minDist) {
          minDist = dist;
          closest = el;
        }
      });

      if (closest) {
        const ayatDetails = {
          ayat: parseInt(closest.id.replace("ayat-", "")),
          surahId: closest.dataset.surahId,
          juzId: closest.dataset.juzId,
        };

        setTopAyat(ayatDetails);
        queryClient.setQueryData(["topAyat"], ayatDetails);
      }
    }, 100);

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, [queryClient]);

  const getSurahName = (surahId) => {
    return (
      surahId +
      ": " +
      surahs.find((s) => {
        return s.uuid === +surahId;
      })?.transliteration
    );
  };

  const getJuzName = (juzId) => {
    return juzId + ": " + juz.find((j) => j.uuid === +juzId)?.transliteration;
  };

  const renderAyat = () => {
    return ayatData.map((dt, index) => {
      return (
        <Box as="span" key={index} display="inline">
          {dt.surahStart && <SurahHeader rtl />}
          <AyatWithMarker data={dt} />
        </Box>
      );
    });
  };

  return (
    <RdWrapperUI fileId={fileId} ref={scrollRef}>
      <Flex gap={1} direction="column" position="relative">
        {topAyat && (
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
            <Text fontSize="12px">Juz {getJuzName(topAyat.juzId)}</Text>
            <Text fontSize="12px">Surah {getSurahName(topAyat.surahId)}</Text>
          </Flex>
        )}
        <Flex flex={1} px={marginX} py={1}>
          <Box
            fontFamily="ArabicFont"
            whiteSpace="normal"
            wordBreak="break-word"
            textAlign="right"
            dir="rtl"
          >
            {renderAyat()}
          </Box>
        </Flex>
      </Flex>
    </RdWrapperUI>
  );
};
