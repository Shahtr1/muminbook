import { Flex, Icon, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RiCloseCircleFill } from "react-icons/ri";
import { useWindows } from "@/hooks/resource/useWindows.js";
import { useDeleteWindow } from "@/hooks/useDeleteWindow.js";

export const WinManager = ({ onEmpty }) => {
  const { mutate: deleteWindow } = useDeleteWindow();
  const borderColor = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("brand.400", "brand.600");
  const winModeHoverBg = useColorModeValue(
    "wn.icon.hover.light",
    "wn.icon.hover.dark",
  );
  const activeWindowColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  const inActiveWindowColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  const { windows = [] } = useWindows();

  const queryClient = useQueryClient();

  const windowMode = queryClient.getQueryData(["windowMode"]) || false;

  useEffect(() => {
    onEmpty?.(windows.length === 0);
  }, [windows.length]);

  if (!windows.length) return null;

  const closeWindow = (id) => {
    deleteWindow(id);
  };

  const openWindow = (type) => {
    console.log("open window", type);
  };

  return (
    <Flex px={1} h="win-manager-height" w="100%" overflowX="auto">
      {windows.map((win) => {
        const { _id, typeId: type } = win;
        return (
          <Flex
            key={win._id}
            bgColor={
              windowMode
                ? win.isActive
                  ? activeWindowColor
                  : inActiveWindowColor
                : "brand.500"
            }
            _hover={{ bgColor: windowMode ? winModeHoverBg : hoverBg }}
            p={1}
            cursor="pointer"
            align="center"
            borderTopRadius="md"
            border="1px solid"
            borderBottom="none"
            borderColor={borderColor}
            flex="1 1 0"
            minW="45px"
            maxW="120px"
            justify="space-between"
            gap={1}
            onClick={() => openWindow(type)}
          >
            <Tooltip label={type.title} hasArrow placement="top">
              <Text
                fontSize="12px"
                fontWeight="600"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {type.title}
              </Text>
            </Tooltip>
            <Icon
              as={RiCloseCircleFill}
              fontSize="10px"
              _hover={{ color: "red.600" }}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(_id);
              }}
            />
          </Flex>
        );
      })}
    </Flex>
  );
};
