import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";
import { Box } from "@chakra-ui/react";
import { AyahWithMarker } from "@/components/layout/reading/AyahWithMarker.jsx";

export const QuranUI = ({ fileId, page }) => {
  const { data: ayatData } = page;

  return (
    <RdWrapperUI fileId={fileId}>
      <SurahHeader rtl />
      <Box
        fontFamily="ArabicFont"
        dir="rtl"
        whiteSpace="normal"
        wordBreak="break-word"
        textAlign="right"
      >
        {ayatData.map((dt, index) => (
          <AyahWithMarker key={index} ayah={dt.ayat} />
        ))}
      </Box>
    </RdWrapperUI>
  );
};
