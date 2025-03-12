import {
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { forwardRef } from "react";

export const SidebarItem = forwardRef(
  (
    { item, isOpen, pl, active, fontSize, fontWeight, isSubItem = false },
    ref,
  ) => {
    const navigate = useNavigate();
    const textColor = useColorModeValue("text-primary", "whiteAlpha.900");
    const isSmallScreen = useBreakpointValue({ base: true, sm: false });
    const subItems = item.items || [];

    if (!fontSize) {
      fontSize = isSmallScreen ? "12px" : isOpen ? "18px" : "11px";
    }

    if (!fontWeight) {
      fontWeight = isSmallScreen ? "500" : "600";
    }

    return (
      <Flex flexDir="column">
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
            !isSubItem && !isSmallScreen
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
            fontSize={fontSize}
            fontWeight={fontWeight}
            whiteSpace="nowrap"
          >
            {item.label}
          </Text>
        </Flex>
        <Flex flexDir="column">
          {subItems &&
            subItems.map((subItem, index) => {
              const active = location.pathname === subItem.link;
              return (
                <SidebarItem
                  key={index}
                  item={subItem}
                  isOpen={isOpen}
                  pl="30px"
                  active={active}
                  fontSize="13px"
                  isSubItem={true}
                ></SidebarItem>
              );
            })}
        </Flex>
      </Flex>
    );
  },
);
