import { Flex, useColorModeValue } from "@chakra-ui/react";
import { SurahSVG } from "@/components/svgs/frames/SurahSVG.jsx";
import { AyatSVG } from "@/components/svgs/frames/AyatSVG.jsx";

export const SurahHeader = ({ rtl = false }) => {
  const frameColor = useColorModeValue("text.primary", "whiteAlpha.900");

  return (
    <Flex
      w="100%"
      justify="center"
      align="center"
      h="40px"
      gap={1}
      flexDir={rtl ? "row-reverse" : "row"}
    >
      <Flex flex={1} h="1px" bgColor={frameColor}></Flex>
      <AyatSVG dimensions="30px" activeColor={frameColor} />
      <SurahSVG activeColor={frameColor} />
      <Flex
        flex={1}
        align="center"
        gap={1}
        flexDir={rtl ? "row-reverse" : "row"}
      >
        <Flex flex={1} h="1px" bgColor={frameColor}></Flex>
        <AyatSVG dimensions="22px" activeColor={frameColor} />
        <SurahSVG isSmall activeColor={frameColor} />
      </Flex>
    </Flex>
  );
};
