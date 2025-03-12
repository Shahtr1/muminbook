import {
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { forwardRef } from "react";

export const SidebarItem = forwardRef(({ item, isOpen, pl, active }, ref) => {
  const navigate = useNavigate();
  const textColor = useColorModeValue("text-primary", "whiteAlpha.900");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });

  return (
    <Flex
      ref={ref}
      align="center"
      justify={isOpen ? "flex-start" : "center"}
      gap={2}
      py={isSmallScreen ? "10px" : 2}
      cursor="pointer"
      pl={pl}
      px={isSmallScreen ? 2 : undefined}
      borderLeft={
        !isSmallScreen
          ? active
            ? "4px solid"
            : "4px solid transparent"
          : undefined
      }
      borderBottom={
        isSmallScreen
          ? active
            ? "2px solid"
            : "2px solid transparent"
          : undefined
      }
      borderColor={active ? "brand.500" : "transparent"}
      onClick={() => navigate(item.link)}
      direction={isOpen ? "row" : "column"}
      border={!isOpen && !isSmallScreen ? "none" : undefined}
    >
      {!isSmallScreen && item.icon && (
        <item.icon
          activeColor={active ? "brand.500" : textColor}
          smallSize={isOpen ? "md" : "sm"}
        />
      )}
      <Text
        color={active ? "brand.500" : textColor}
        fontSize={isSmallScreen ? "12px" : isOpen ? "18px" : "11px"}
        fontWeight={isSmallScreen ? "500" : "600"}
        whiteSpace="nowrap"
      >
        {item.label}
      </Text>
    </Flex>
  );
});
