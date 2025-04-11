import {
  Box,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { userItems } from "@/data/userItems.js";
import { notificationItems } from "@/data/notificationItems.js";
import { featureItems } from "@/data/featureItems.js";
import { AUTH } from "@/hooks/useAuth.js";
import { useQueryClient } from "@tanstack/react-query";
import { navItems } from "@/data/navbarItems.js";
import { IoChevronForwardOutline, IoMenuOutline } from "react-icons/io5";

export const WindowMenu = () => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const hoverGray = useColorModeValue(
    "rd.icon.hover.light",
    "rd.icon.hover.dark",
  );
  const bgColor = useColorModeValue("rd.bg.light", "rd.bg.dark");
  const iconActiveColor = useColorModeValue("rd.bold.light", "rd.bold.dark");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData([AUTH]);

  const itemMap = {
    user: userItems,
    notifications: notificationItems,
    features: featureItems(),
  };

  const parentItems = navItems(user);

  const menuList = (list, label, isSubMenu = false) => {
    return (
      <Menu isLazy placement={isSubMenu ? "right-start" : "bottom-start"}>
        <MenuButton
          as={Flex}
          align="center"
          justifyContent="center"
          cursor="pointer"
          height="100%"
          sx={{
            "> span": {
              height: "100%",
            },
          }}
        >
          <Flex
            _hover={{ bg: "red.600" }}
            cursor="pointer"
            align="center"
            justify={isSubMenu ? "space-between" : "center"}
            w={label ? "auto" : "28px"}
            role="group"
            onClick={close}
          >
            {label ? (
              <>
                <Text variant="rd" cursor="pointer" p="3px" fontSize="12px">
                  {label}
                </Text>
                {isSubMenu && (
                  <Box pr="3px">
                    <Icon
                      as={IoChevronForwardOutline}
                      boxSize="9px"
                      color={iconActiveColor}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Icon as={IoMenuOutline} boxSize={5} color={iconActiveColor} />
            )}
          </Flex>
        </MenuButton>
        <MenuList
          sx={{
            button: {
              height: "auto",
              padding: "0",
            },
            padding: "0",
            background: bgColor,
            border: "none",
            minW: "120px",
          }}
        >
          {list.map((it) => {
            if (itemMap[it.id]) return menuList(itemMap[it.id], it.label, true);
            else
              return (
                <MenuItem
                  key={it.id}
                  display="flex"
                  alignItems="center"
                  whiteSpace="nowrap"
                  _hover={{ bg: hoverGray }}
                  w="100%"
                  onClick={() => navigate(it.link)}
                >
                  <Text
                    key={it.id}
                    variant="rd"
                    cursor="pointer"
                    p="3px"
                    fontSize="12px"
                  >
                    {it.label}
                  </Text>
                </MenuItem>
              );
          })}
        </MenuList>
      </Menu>
    );
  };

  const desktopNav = () => {
    {
      return parentItems.map((it) => {
        if (itemMap[it.id]) return menuList(itemMap[it.id], it.label);
        else
          return (
            <Text
              key={it.id}
              variant="rd"
              cursor="pointer"
              p="3px"
              fontSize="12px"
              onClick={() => navigate(it.link)}
            >
              {it.label}
            </Text>
          );
      });
    }
  };

  return isSmallScreen ? menuList(parentItems) : desktopNav();
};
