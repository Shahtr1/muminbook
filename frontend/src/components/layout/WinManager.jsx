import { Flex, Icon, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RiCloseCircleFill } from "react-icons/ri";
import { useWindows } from "@/hooks/resource/useWindows.js";
import { useDeleteWindow } from "@/hooks/useDeleteWindow.js";
import { useLocation, useNavigate } from "react-router-dom";

export const WinManager = ({ onEmpty, closeWindowId, minimizeWindowId }) => {
  const { mutate: deleteWindow } = useDeleteWindow();
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    if (closeWindowId) {
      closeWindow(closeWindowId);
    }
  }, [closeWindowId]);

  useEffect(() => {
    if (minimizeWindowId) {
      console.log("Minimize window:", minimizeWindowId);
    }
  }, [minimizeWindowId]);

  if (!windows.length) return null;

  const closeWindow = (typeId) => {
    const windowToClose = windows.find((w) => w.typeId._id === typeId);
    if (!windowToClose) return;

    const isActive = isActiveWindow(typeId);
    const remainingWindows = windows.filter((w) => w.typeId._id !== typeId);

    if (isActive) {
      if (remainingWindows.length > 0) {
        const next = remainingWindows[0];
        navigate(`/suhuf/${next.typeId._id}`);
      } else navigate("/", { replace: true });
    }

    deleteWindow({ id: windowToClose._id, typeId, type: "suhuf" });
  };

  const openWindow = (id) => {
    navigate(`/suhuf/${id}`);
  };

  const isActiveWindow = (id) => {
    return location.pathname === `/suhuf/${id}`;
  };

  return (
    <Flex px={1} h="win-manager-height" w="100%" overflowX="auto">
      {windows.map((win) => {
        const { typeId: type } = win;
        return (
          <Flex
            key={win._id}
            bgColor={
              windowMode
                ? isActiveWindow(type._id)
                  ? activeWindowColor
                  : inActiveWindowColor
                : "brand.500"
            }
            _hover={{
              bgColor: windowMode
                ? isActiveWindow(type._id)
                  ? activeWindowColor
                  : winModeHoverBg
                : hoverBg,
            }}
            p={1}
            cursor="pointer"
            align="center"
            borderTopRadius="md"
            border="1px solid"
            borderBottom="none"
            borderColor={borderColor}
            flex="1 1 0"
            minW="45px"
            maxW="140px"
            justify="space-between"
            gap={1}
            onClick={() => openWindow(type?._id)}
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
            {!isActiveWindow(type._id) && (
              <Icon
                as={RiCloseCircleFill}
                fontSize="10px"
                _hover={{ color: "red.600" }}
                onClick={(e) => {
                  e.stopPropagation();
                  closeWindow(type._id);
                }}
              />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
};
