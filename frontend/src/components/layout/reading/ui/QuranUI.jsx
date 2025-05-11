import { RdWrapperUI } from "@/components/layout/reading/ui/RdWrapperUI.jsx";
import { SurahHeader } from "@/components/layout/reading/ui/SurahHeader.jsx";
import {
  Box,
  Flex,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { AyahWithMarker } from "@/components/layout/reading/AyahWithMarker.jsx";

export const QuranUI = ({ fileId, page }) => {
  const { data: ayatData } = page;
  const color = useColorModeValue("text.primary", "whiteAlpha.900");
  const bgContentColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const marginX = isSmallScreen ? 1 : 2;
  return (
    <RdWrapperUI fileId={fileId}>
      <Flex gap={1} flexDir="column" position="relative">
        <Flex
          mx={isSmallScreen ? 1 : 2}
          borderBottom="1px solid"
          borderColor={color}
          position="sticky"
          top="0"
          bgColor={bgContentColor}
          w={`calc(100%-${marginX})`}
          zIndex={1}
        >
          hi
        </Flex>
        <Flex flex={1} px={marginX} py={1}>
          <Box
            fontFamily="ArabicFont"
            whiteSpace="normal"
            wordBreak="break-word"
            textAlign="right"
            dir="rtl"
          >
            {ayatData.map((dt, index) => (
              <span key={index}>
                <Box as="span" display="inline">
                  {dt.surahStart && <SurahHeader rtl />}
                </Box>
                <AyahWithMarker ayah={dt.ayat} />
              </span>
            ))}
          </Box>
        </Flex>
      </Flex>
    </RdWrapperUI>
  );
};
