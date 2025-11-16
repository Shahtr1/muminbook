import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { SurahSVG } from "@/components/svgs/frames/SurahSVG.jsx";
import { AyatSVG } from "@/components/svgs/frames/AyatSVG.jsx";
import { toArabicNumeral } from "@/utils/toArabicNumeral.js";
import { useParentWidth } from "@/hooks/useParentWidth.js";

export const SurahHeader = ({ rtl = false, surah, juz }) => {
  const frameColor = useColorModeValue("text.primary", "whiteAlpha.900");
  const surahName = rtl ? surah.name : surah.transliteration;
  const surahNumber = rtl ? toArabicNumeral(surah.uuid) : surah.uuid;
  const juzName = rtl ? juz.name : juz.transliteration;
  const juzNumber = rtl ? toArabicNumeral(juz.uuid) : juz.uuid;

  const sm = 480;
  const [containerRef, width] = useParentWidth();
  const isSmallScreen = width < sm;

  return (
    <Flex
      ref={containerRef}
      data-idx={`surah-header-${surah.uuid}`}
      w="100%"
      justify="center"
      align="center"
      h="40px"
      gap={1}
      flexWrap="wrap"
      position="relative"
      mb={isSmallScreen ? 4 : 2}
      mt={2}
      fontFamily={rtl ? "ArabicFont" : "Nunito Sans"}
      fontSize={rtl ? "20px" : "13px"}
    >
      <Flex flex={1} h="1px" bgColor={frameColor}></Flex>
      <Flex position="relative" justify="center" align="center">
        <AyatSVG
          dimensions={isSmallScreen ? "25px" : "35px"}
          activeColor={frameColor}
        />
        <Text
          position="absolute"
          top="40%"
          left="50%"
          transform="translate(-50%, -50%)"
          fontSize={isSmallScreen ? "18px" : "25px"}
          whiteSpace="nowrap"
        >
          {surahNumber}
        </Text>
      </Flex>
      <Flex position="relative" justify="center" align="center">
        <SurahSVG isSmall={isSmallScreen} activeColor={frameColor} />
        <Text
          position="absolute"
          top="45%"
          left="50%"
          transform="translate(-50%, -50%)"
          fontSize={isSmallScreen ? "17px" : "25px"}
          whiteSpace="nowrap"
        >
          {surahName}
        </Text>
      </Flex>

      {isSmallScreen && (
        <Box
          display="flex"
          alignItems="center"
          fontSize="18px"
          position="absolute"
          bottom="-5"
          left="50%"
          transform="translateX(-50%)"
        >
          <Text>{rtl ? "الجزء" : "Juz"}</Text>
          <Text mx={1}>-</Text>
          <Text whiteSpace="nowrap">{juzNumber}</Text>
          <Text mx={1}>-</Text>
          <Text whiteSpace="nowrap">{juzName}</Text>
        </Box>
      )}

      <Flex flex={1} align="center" gap={1}>
        <Flex flex={1} h="1px" bgColor={frameColor}></Flex>
        {!isSmallScreen && (
          <>
            <Text>{rtl ? "الجزء" : "Juz"}</Text>
            <Flex position="relative" justify="center" align="center">
              <AyatSVG dimensions="25px" activeColor={frameColor} />
              <Text
                position="absolute"
                top="37%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize="17px"
                whiteSpace="nowrap"
              >
                {juzNumber}
              </Text>
            </Flex>
            <Flex position="relative" justify="center" align="center">
              <SurahSVG isSmall activeColor={frameColor} />
              <Text
                position="absolute"
                top="37%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize="17px"
                whiteSpace="nowrap"
              >
                {juzName}
              </Text>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
};
