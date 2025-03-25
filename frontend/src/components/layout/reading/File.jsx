import { useEffect, useState } from "react";
import { Flex, Text, Tooltip, useBreakpointValue } from "@chakra-ui/react";
import { FileSVG } from "@/components/svgs/FileSVG.jsx";

export const File = ({ onClick, width, label }) => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const dimensions = useBreakpointValue({
    base: "55px",
    sm: "60px",
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Flex
      width={width}
      justify="center"
      align="center"
      flexDirection="column"
      onClick={onClick}
      cursor="pointer"
    >
      <FileSVG dimensions={dimensions} activeColor="brand.500" />
      <Tooltip label={label} hasArrow placement="bottom">
        <Text
          fontSize="13px"
          color="brand.500"
          fontWeight="medium"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          maxWidth="100%"
        >
          {label}
        </Text>
      </Tooltip>
    </Flex>
  );
};
