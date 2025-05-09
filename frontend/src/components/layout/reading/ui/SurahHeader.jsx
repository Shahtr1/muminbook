import { Flex, useColorModeValue } from "@chakra-ui/react";
import { SurahSVG } from "@/components/svgs/frames/SurahSVG.jsx";

export const SurahHeader = () => {
  const frameColor = useColorModeValue("text.primary", "whiteAlpha.900");

  return (
    <Flex w="100%" justify="center" align="center" h="40px" gap={1}>
      <Flex flex={1} h="1px" bgColor={frameColor}></Flex>
      <SurahSVG activeColor={frameColor} />
      <Flex flex={1} h="1px" bgColor={frameColor}></Flex>
    </Flex>
  );
};
