import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";
import { Box } from "@chakra-ui/react";
import { AyahWithMarker } from "@/components/layout/reading/AyahWithMarker.jsx";

export const QuranUI = ({ fileId, page }) => {
  const { data: ayatData } = page;

  return (
    <RdWrapperUI fileId={fileId}>
      <Box
        fontFamily="ArabicFont"
        whiteSpace="normal"
        wordBreak="break-word"
        textAlign="right"
        dir="rtl"
      >
        {ayatData.map((dt, index) => (
          <span>
            {dt.surahStart && <SurahHeader rtl />}
            <AyahWithMarker key={index} ayah={dt.ayat} />
          </span>
        ))}
      </Box>
    </RdWrapperUI>
  );
};
