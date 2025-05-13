import React, { useMemo } from "react";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useSurahs } from "@/hooks/quran/useSurahs.js";
import { useJuz } from "@/hooks/quran/useJuz.js";
import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { useReadingDetail } from "@/hooks/reading/useReadings.js";
import { AyatWithMarker } from "@/components/layout/reading/AyatWithMarker.jsx";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";

export const QuranUI = ({ fileId }) => {
  const {
    reading,
    isPending: isReadingPending,
    isError: isReadingError,
  } = useReadingDetail(fileId);

  const {
    surahs,
    isPending: isSurahsPending,
    isError: isSurahsError,
  } = useSurahs();
  const { juzList, isPending: isJuzPending, isError: isJuzError } = useJuz();

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const marginX = isSmallScreen ? 1 : 2;

  const renderedAyat = useMemo(() => {
    let lastJuzId = null;
    return reading?.map((dt) => {
      const surah = surahs.find((s) => s._id === dt.surahId);
      const juz = juzList.find((j) => j._id === dt.juzId);
      const isNewJuz = juz.uuid !== lastJuzId;
      if (isNewJuz) {
        lastJuzId = juz.uuid;
      }
      return (
        <Box as="span" key={`${dt.uuid}`} display="inline">
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
  }, [reading]);

  if (isReadingPending || isSurahsPending || isJuzPending) return <Loader />;
  if (isReadingError || isSurahsError || isJuzError)
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
            {renderedAyat}
          </Box>
        </Flex>
      </Flex>
    </RdWrapperUI>
  );
};
