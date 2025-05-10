import {
  Box,
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { SurahSVG } from "@/components/svgs/frames/SurahSVG.jsx";
import { AyatSVG } from "@/components/svgs/frames/AyatSVG.jsx";
import { toArabicNumeral } from "@/utils/toArabicNumeral.js";

export const SurahHeader = ({ rtl = false }) => {
  const frameColor = useColorModeValue("text.primary", "whiteAlpha.900");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  return (
    <Flex
      w="100%"
      justify="center"
      align="center"
      h="40px"
      gap={1}
      flexDir={rtl ? "row-reverse" : "row"}
      flexWrap="wrap"
      position="relative"
      mb={isSmallScreen ? 2 : 0}
    >
      <Flex flex={1} h="1px" bgColor={frameColor}></Flex>
      <AyatSVG
        dimensions={isSmallScreen ? "22px" : "30px"}
        activeColor={frameColor}
      />
      <SurahSVG isSmall={isSmallScreen} activeColor={frameColor} />

      {isSmallScreen && (
        <Box
          dir={rtl ? "rtl" : "ltr"}
          display="flex"
          alignItems="center"
          fontSize="xs"
          position="absolute"
          bottom="-2"
          left="50%"
          transform="translateX(-50%)"
        >
          <Text>{rtl ? "الجزء" : "Juz"}</Text>
          <Text mx={1}>-</Text>
          <Text>{rtl ? toArabicNumeral(1) : "1"}</Text>
        </Box>
      )}

      <Flex
        flex={1}
        align="center"
        gap={1}
        flexDir={rtl ? "row-reverse" : "row"}
      >
        <Flex flex={1} h="1px" bgColor={frameColor}></Flex>
        {!isSmallScreen && (
          <>
            <Text fontSize="13px">{rtl ? "الجزء" : "Juz"}</Text>
            <AyatSVG dimensions="22px" activeColor={frameColor} />
            <SurahSVG isSmall activeColor={frameColor} />
          </>
        )}
      </Flex>
    </Flex>
  );
};
