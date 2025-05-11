import {
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { toArabicNumeral } from "@/utils/toArabicNumeral.js";

export const AyahWithMarker = ({ ayah, number }) => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const svgImage = useColorModeValue(
    "/images/frames/ayat-dark.svg",
    "/images/frames/ayat-light.svg",
  );
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");

  const fontSize = isSmallScreen ? "25px" : "30px";
  const numberFontSize = isSmallScreen ? "14px" : "16px";

  return (
    <span
      style={{
        fontSize: `${fontSize}`,
        lineHeight: `${isSmallScreen ? "2.5rem" : "3.1rem"}`,
      }}
    >
      <Flex
        as="span"
        display="inline"
        cursor="pointer"
        _hover={{ bgColor: bgColor }}
        borderRadius="sm"
        px={isSmallScreen ? 1 : 2}
      >
        {ayah}
      </Flex>
      <Flex
        display="inline-flex"
        position="relative"
        w="24px"
        h="24px"
        mx={isSmallScreen ? 1 : 2}
        dir="rtl"
      >
        <Text
          style={{
            display: "inline-block",
            width: "27px",
            height: "27px",
            backgroundImage: `url(${svgImage})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            verticalAlign: "middle",
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <Text
          whiteSpace="nowrap"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          fontSize={numberFontSize}
        >
          {toArabicNumeral(258)}
        </Text>
      </Flex>
    </span>
  );
};
