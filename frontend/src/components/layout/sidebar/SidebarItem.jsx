import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { forwardRef } from "react";

export const SidebarItem = forwardRef(
  (
    {
      item,
      isOpen,
      active,
      fontSize,
      fontWeight,
      isSubItem = false,
      isMenu = false,
    },
    ref,
  ) => {
    const textColor = useColorModeValue("text-primary", "whiteAlpha.900");
    const isSmallScreen = useBreakpointValue({ base: true, sm: false });
    const navigate = useNavigate();

    const subItems = item.items || [];

    if (!fontSize) {
      fontSize = isSmallScreen ? "12px" : isOpen ? "18px" : "11px";
    }

    if (!fontWeight) {
      fontWeight = isSmallScreen ? "500" : "600";
    }

    const parentContent = (isMenu, ref) => {
      const menuButtonStyles = {
        sx: {
          "> span": {
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "10px",
            alignItems: "center",
          },
        },
      };

      return (
        <Flex
          as={isMenu ? MenuButton : Flex}
          ref={ref}
          align="center"
          justify={isOpen ? "flex-start" : "center"}
          gap={2}
          cursor="pointer"
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
          {...(isMenu ? menuButtonStyles : {})}
        >
          {!isSmallScreen && item.icon && (
            <item.icon
              activeColor={active ? "brand.500" : textColor}
              viewBox={isOpen ? "sm" : "lg"}
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
      );
    };

    const menuContent = (isMenu = false) => {
      return (
        <Flex
          as={isMenu ? Menu : Flex}
          flexDir="column"
          placement={isSmallScreen ? "bottom" : "right"}
        >
          {parentContent(isMenu, ref)}
          <Flex flexDir="column" as={isMenu ? MenuList : Flex}>
            {subItems &&
              subItems.map((subItem, index) => {
                const active = location.pathname === subItem.link;
                return (
                  <SidebarItem
                    key={index}
                    item={subItem}
                    isOpen={isOpen}
                    active={active}
                    fontSize="13px"
                    isSubItem={true}
                  ></SidebarItem>
                );
              })}
          </Flex>
        </Flex>
      );
    };

    return menuContent(subItems.length > 0 && (!isOpen || isSmallScreen));
  },
);
