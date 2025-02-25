import { Flex, Image, Text, useColorMode, VStack } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { UserMenu } from "@/components/layout/UserMenu.jsx";

export const NavItem = ({ item, images }) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive =
    location.pathname === item.link ||
    (location.pathname === "/" && item.link === "/dashboard");

  const iconMode = colorMode === "light" ? "dark" : "light";
  const iconSrc =
    images[`${iconMode}${isActive ? "-active" : ""}`] ||
    `/images/icons/${item.icon}-${iconMode}${isActive ? "-active" : ""}.svg`;

  const navContent = (
    <VStack
      w={90}
      key={item.id}
      id={item.id}
      spacing={0}
      justify="center"
      borderBottom="2px solid"
      borderColor={
        isActive
          ? colorMode === "light"
            ? "icon.lightActive"
            : "icon.darkActive"
          : "transparent"
      }
      cursor="pointer"
      transition="border-bottom-width 0.2s ease-in-out, border-bottom-color 0.2s ease-in-out"
      onClick={() => navigate(item.link)}
    >
      <Image w={5} h={5} src={iconSrc} alt={item.label} />
      <Flex align={"end"}>
        <Text
          fontSize="12px"
          color={
            isActive
              ? colorMode === "light"
                ? "icon.lightActive"
                : "icon.darkActive"
              : colorMode === "light"
                ? "icon.light"
                : "icon.dark"
          }
        >
          {item.label}
        </Text>
        {item.id === "user-menu" && (
          <ChevronDownIcon
            color={
              isActive
                ? colorMode === "light"
                  ? "icon.lightActive"
                  : "icon.darkActive"
                : colorMode === "light"
                  ? "icon.light"
                  : "icon.dark"
            }
          />
        )}
      </Flex>
    </VStack>
  );

  return item.id === "user-menu" ? (
    <UserMenu key={item.id} id={item.id}>
      {navContent}
    </UserMenu>
  ) : (
    navContent
  );
};
