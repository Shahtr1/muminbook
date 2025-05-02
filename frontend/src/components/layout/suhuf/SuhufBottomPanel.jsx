import { Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { useReading } from "@/hooks/useReading.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useParams } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { useUpdateSuhufLayout } from "@/hooks/suhuf/useUpdateSuhufLayout.js";

export const SuhufBottomPanel = ({ onToggle }) => {
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { mutate: updateLayout } = useUpdateSuhufLayout(suhufId);

  const layout = suhuf?.config?.layout || {};
  const isOpen = layout?.isBottomTabOpen || false;

  const toggleBottomTab = () => {
    const newOpen = !isOpen;

    updateLayout({
      layout: {
        ...layout,
        isBottomTabOpen: newOpen,
      },
    });

    if (onToggle) {
      onToggle(newOpen);
    }
  };

  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");
  const boldColor = useColorModeValue("wn.bold.light", "wn.bold.dark");
  const { readings, isPending, isError, isSuccess } = useReading();

  return (
    <Flex h="100%" w="100%" bg={bgColor} flexDir="column">
      {isPending && <Loader />}
      {isError && <SomethingWentWrong transparent />}
      {isSuccess && (
        <>
          <Flex
            w="100%"
            justify="space-between"
            align="center"
            gap={1}
            px={2}
            py="1px"
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <Flex w="100%" gap={5} overflowX="auto" flex="1">
              <Text variant="wn" cursor="pointer" fontSize="12px">
                Debug
              </Text>
              <Text
                variant="wn"
                cursor="pointer"
                fontSize="12px"
                color="brand.500"
              >
                Terminal
              </Text>
              <Text variant="wn" cursor="pointer" fontSize="12px">
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
          <Flex flex={1} overflowY="auto" w="100%" direction="column">
            {Array(20)
              .fill(null)
              .map((_, i) => (
                <Flex key={i}>Line {i + 1}</Flex>
              ))}
          </Flex>
        </>
      )}
    </Flex>
  );
};
