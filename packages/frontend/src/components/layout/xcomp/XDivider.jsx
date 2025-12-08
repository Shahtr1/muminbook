import { Divider, useColorModeValue } from "@chakra-ui/react";

export const XDivider = ({ orientation, height }) => {
  return (
    <Divider
      orientation={orientation}
      height={height}
      backgroundColor={useColorModeValue("gray.300", "whiteAlpha.300")}
    />
  );
};
