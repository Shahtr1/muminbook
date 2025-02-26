import { Box, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";

export const SVG = ({ dimensions, children, active }) => {
  const responsiveViewBox = useBreakpointValue({
    base: "0 0 48 48",
    md: "0 0 68 68",
  });

  const color = useColorModeValue(
    active ? "text.primary" : "text.secondary",
    active ? "white" : "whiteAlpha.700",
  );

  return (
    <Box
      as="svg"
      width={dimensions}
      height={dimensions}
      viewBox={responsiveViewBox}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      cursor="pointer"
      overflow="visible"
      onMouseEnter={(e) =>
        e.currentTarget.setAttribute(
          "fill",
          useColorModeValue("text.primary", "white"),
        )
      }
      onMouseLeave={(e) => e.currentTarget.setAttribute("fill", color)}
    >
      {children}
    </Box>
  );
};
