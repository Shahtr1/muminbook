import { useEffect, useState } from "react";
import { Flex, Text, Tooltip, useBreakpointValue } from "@chakra-ui/react";
import { FileSVG } from "@/components/svgs/FileSVG.jsx";
import { ItemToolbar } from "@/components/layout/reading/toolbar/ItemToolbar.jsx";
import { ResourcesToolbar } from "@/components/layout/reading/resources/ResourcesToolbar.jsx";

export const File = ({ onClick, width, label, isFavourite }) => {
  const dimensions = useBreakpointValue({
    base: "40px",
    sm: "60px",
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Flex width={width} cursor="pointer" position="relative">
      <ItemToolbar
        isFavourite={isFavourite}
        zIndex="99999"
        children={<ResourcesToolbar />}
      />
      <Flex
        justify="center"
        align="center"
        flexDirection="column"
        onClick={onClick}
        overflow="hidden"
      >
        <FileSVG dimensions={dimensions} activeColor="brand.500" />
        <Tooltip label={label} hasArrow placement="bottom">
          <Text
            fontSize={{ base: "10px", sm: "13px" }}
            color="brand.500"
            fontWeight="medium"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            maxW="100%"
          >
            {label}
          </Text>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
