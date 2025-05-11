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

  const fontSize = isSmallScreen ? "25px" : "30px";
  const numberFontSize = isSmallScreen ? "14px" : "16px";

  return (
    <span
      style={{
        marginLeft: "6px",
        fontSize: `${fontSize}`,
        lineHeight: `${isSmallScreen ? "2.5rem" : "3rem"}`,
      }}
    >
      <span style={{ marginLeft: "6px" }}>{ayah}</span>
      <Flex display="inline-flex" position="relative" w="24px" h="24px">
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
