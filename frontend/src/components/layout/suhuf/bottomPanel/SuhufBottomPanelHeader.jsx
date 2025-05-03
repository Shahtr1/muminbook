import { useParams } from "react-router-dom";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { useUpdateSuhufConfig } from "@/hooks/suhuf/useUpdateSuhufConfig.js";
import { Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export const SuhufBottomPanelHeader = ({ hasBorder = false, data = [] }) => {
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);

  const layout = suhuf?.config?.layout || {};
  const isOpen = layout?.isBottomTabOpen || false;

  const toggleBottomTab = () => {
    const newOpen = !isOpen;

    updateConfig({
      layout: {
        ...layout,
        isBottomTabOpen: newOpen,
      },
    });
  };

  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");
  const boldColor = useColorModeValue("wn.bold.light", "wn.bold.dark");

  return (
    <Flex
      w="100%"
      justify="space-between"
      align="center"
      gap={1}
      px={2}
      borderBottom="1px solid"
      borderTop={hasBorder ? "1px solid" : "none"}
      borderColor={borderColor}
      onClick={toggleBottomTab}
    >
      <Flex w="100%" gap={5} overflowX="auto" flex="1">
        <Text variant="wn" cursor="pointer" fontSize="12px" py={1}>
          Debug
        </Text>
        <Text
          variant="wn"
          cursor="pointer"
          fontSize="12px"
          color="brand.500"
          py={1}
          px={2}
          borderBottom="2px solid"
          borderBottomColor="brand.500"
        >
          Terminal
        </Text>
        <Text variant="wn" cursor="pointer" fontSize="12px" py={1}>
          Code
        </Text>
      </Flex>
      <Icon
        as={isOpen ? IoIosArrowDown : IoIosArrowUp}
        boxSize={5}
        color={boldColor}
        cursor="pointer"
        onClick={toggleBottomTab}
      />
    </Flex>
  );
};
