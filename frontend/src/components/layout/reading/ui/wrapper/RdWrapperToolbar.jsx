import { Box, Flex, Icon, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { FaComment, FaHighlighter } from "react-icons/fa";
import { FaArrowPointer } from "react-icons/fa6";

export const RdWrapperToolbar = () => {
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");
  const iconActiveColor = useColorModeValue("wn.bold.light", "wn.bold.dark");
  const iconColor = useColorModeValue("wn.icon.light", "wn.icon.dark");
  const iconHoverGray = useColorModeValue(
    "wn.icon.hover.light",
    "wn.icon.hover.dark",
  );

  const toolbarData = [
    { label: "Select text", id: "text-select", icon: FaArrowPointer },
    { label: "Add a comment", id: "comment", icon: FaComment },
    { label: "Highlight text", id: "highlight", icon: FaHighlighter },
  ];

  return (
    <Box
      h="fit-content"
      borderRadius="sm"
      border="1px solid"
      borderColor={borderColor}
      m="3px"
    >
      <Flex
        h="100%"
        w="25px"
        bgColor={bgColor}
        align="center"
        flexDir="column"
        flexDirection="column"
        gap={2}
        py={2}
      >
        {toolbarData.map((item) => (
          <Tooltip
            variant="inverted"
            key={item.id}
            label={item.label}
            placement="left"
          >
            <Flex
              _hover={{ bg: iconHoverGray }}
              w="80%"
              justify="center"
              p={1}
              borderRadius="sm"
              cursor="pointer"
            >
              <Icon as={item.icon} boxSize={3} color={iconColor} />
            </Flex>
          </Tooltip>
        ))}
      </Flex>
    </Box>
  );
};
