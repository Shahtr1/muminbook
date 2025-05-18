import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { toArabicNumeral } from "@/utils/toArabicNumeral.js";
import React from "react";

export const AyatWithMarker = ({ item }) => {
  const svgImage = useColorModeValue(
    "/images/frames/ayat-dark.svg",
    "/images/frames/ayat-light.svg",
  );
  return (
    <Box as="span" key={item._id}>
      {item.ayat}
      <Box as="span" position="relative" pr={10}>
        <Text
          style={{
            display: "inline-block",
            width: "30px",
            height: "30px",
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
            top: "55%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          fontSize="17px"
        >
          {toArabicNumeral(item.sno)}
        </Text>
      </Box>
    </Box>
  );
};
