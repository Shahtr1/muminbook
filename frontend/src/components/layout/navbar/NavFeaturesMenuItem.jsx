import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import { NavItem } from "@/components/layout/navbar/NavItem.jsx";
import { FeaturesMenu } from "@/components/layout/menus/FeaturesMenu.jsx";

export const NavFeaturesMenuItem = ({ item }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [hoverMenu, setHoverMenu] = useState(false);

  const activeColor = useColorModeValue("active.light", "active.dark");
  const defaultColor = useColorModeValue("default.light", "default.dark");

  return (
    <FeaturesMenu
      key={item.id}
      onOpen={() => setOpenMenu(item.id)}
      onClose={() => setOpenMenu(null)}
      onMouseEnter={() => setHoverMenu(item.id)}
      onMouseLeave={() => {
        setHoverMenu(null);
      }}
    >
      <Flex position="relative" height="100%" align="center" justify="center">
        <NavItem
          item={{
            ...item,
            active: openMenu || hoverMenu === item.id,
          }}
          activeBorderColor="transparent"
        >
          <Flex align="end">
            <Text
              display={{ base: "none", md: "block" }}
              fontSize="xs"
              fontWeight="medium"
              color={
                openMenu || hoverMenu === item.id ? activeColor : defaultColor
              }
            >
              {item.label}
            </Text>
          </Flex>
        </NavItem>
      </Flex>
    </FeaturesMenu>
  );
};
