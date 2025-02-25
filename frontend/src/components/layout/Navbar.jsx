import { Flex, Image, Text, useColorMode, VStack } from "@chakra-ui/react";
import { DarkModeToggle } from "@/components/layout/DarkModeToggle.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/layout/UserMenu.jsx";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const Navbar = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
      link: "/dashboard",
    },
    { id: "reading", label: "Reading", icon: "reading", link: "/reading" },
    { id: "notifications", label: "Notifications", icon: "bell", link: "#" },
    { id: "user-menu", label: "Me", icon: "user", link: "#" },
  ];

  const hoverColor = colorMode === "light" ? "brand.500" : "whiteAlpha.200";
  const [preloadedImages, setPreloadedImages] = useState({});

  useEffect(() => {
    const loadImages = async () => {
      const images = {};

      await Promise.all(
        navItems.map((item) => {
          return new Promise((resolve) => {
            const lightImg = new window.Image();
            const darkImg = new window.Image();

            lightImg.src = `/images/icons/${item.icon}-light.svg`;
            darkImg.src = `/images/icons/${item.icon}-dark.svg`;

            lightImg.onload = darkImg.onload = () => {
              images[item.icon] = {
                light: darkImg.src,
                dark: lightImg.src,
              };
              resolve();
            };
          });
        }),
      );

      setPreloadedImages(images);
    };

    loadImages();
  }, []);

  return (
    <Flex
      position="fixed"
      h="navbar-height"
      inset={0}
      borderBottom="1px solid"
      borderColor={colorMode === "light" ? "gray.300" : "whiteAlpha.300"}
      boxShadow="sm"
      bg={colorMode === "light" ? "white" : "gray.800"}
      justify="center"
    >
      <Flex justify="space-between" align="end" width="full" maxW="x-max-width">
        <Flex align="center" height="100%">
          <Image
            w={150}
            src="/images/logo-with-image.png"
            alt="Muminbook Logo"
            onClick={() => navigate("/")}
            cursor="pointer"
          />
        </Flex>

        <Flex>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.link ||
              (location.pathname === "/" && item.link === "/dashboard");

            const navContent = (
              <VStack
                w={90}
                key={item.id}
                spacing={0}
                justify="center"
                borderBottom="2px solid"
                borderColor={
                  isActive
                    ? colorMode === "light"
                      ? "icon.light"
                      : "icon.dark"
                    : "transparent"
                }
                cursor="pointer"
                transition="border-bottom-width 0.2s ease-in-out, border-bottom-color 0.2s ease-in-out"
                _hover={
                  isActive
                    ? {}
                    : {
                        borderBottomWidth: "2px",
                        borderBottomColor: hoverColor,
                      }
                }
                _active={{ transform: "scale(0.99)" }}
                onClick={() => navigate(item.link)}
              >
                <Image
                  w={5}
                  h={5}
                  src={
                    preloadedImages[item.icon]?.[colorMode] ||
                    `/images/icons/${item.icon}-${
                      colorMode === "light" ? "dark" : "light"
                    }.svg`
                  }
                  alt={item.label}
                />
                <Flex align={"end"}>
                  <Text
                    fontSize="12px"
                    color={colorMode === "light" ? "icon.light" : "icon.dark"}
                  >
                    {item.label}
                  </Text>
                  {item.id === "user-menu" && (
                    <ChevronDownIcon
                      color={colorMode === "light" ? "icon.light" : "icon.dark"}
                    />
                  )}
                </Flex>
              </VStack>
            );

            return item.id === "user-menu" ? (
              <UserMenu key={item.id}>{navContent}</UserMenu>
            ) : (
              <>{navContent}</>
            );
          })}

          <DarkModeToggle disableInteraction={true} />
        </Flex>
      </Flex>
    </Flex>
  );
};
