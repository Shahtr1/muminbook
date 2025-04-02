import { useEffect, useState } from "react";
import { Flex, Text, Tooltip, useBreakpointValue } from "@chakra-ui/react";
import { FileSVG } from "@/components/svgs/FileSVG.jsx";
import { ItemToolbar } from "@/components/layout/reading/toolbar/ItemToolbar.jsx";
import { ResourceActionItems } from "@/components/layout/reading/resources/ResourceActionItems.jsx";

export const File = ({ id, onClick, width, label }) => {
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
    <Flex
      width={width}
      cursor="pointer"
      position="relative"
      justify="center"
      align="center"
    >
      <ItemToolbar
        children={<ResourceActionItems id={id} type="file" name={label} />}
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
