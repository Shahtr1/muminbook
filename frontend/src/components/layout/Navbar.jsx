import { Flex, Image, Text, useColorMode, VStack } from "@chakra-ui/react";
import { DarkModeToggle } from "@/components/layout/DarkModeToggle.jsx";
import { useLocation, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: "dashboard", link: "/dashboard" },
    { label: "Reading", icon: "reading", link: "/reading" },
    { label: "Notifications", icon: "bell", link: "#" },
    { label: "Me", icon: "user", link: "#" },
  ];

  const hoverColor = colorMode === "light" ? "brand.500" : "whiteAlpha.200";

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
          />
        </Flex>

        <Flex>
          {navItems.map((item, index) => {
            const isActive =
              location.pathname === item.link ||
              (location.pathname === "/" && item.link === "/dashboard");

            return (
              <VStack
                key={index}
                w={90}
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
                _hover={{
                  borderBottomWidth: "2px",
                  borderBottomColor: hoverColor,
                }}
                _active={{
                  transform: "scale(0.99)",
                }}
                onClick={() => navigate(item.link)}
              >
                <Image
                  w={5}
                  h={5}
                  src={`/images/icons/${item.icon}-${colorMode === "light" ? "dark" : "light"}.svg`}
                  alt={item.label}
                />
                <Text
                  fontSize="12px"
                  fontWeight="medium"
                  color={colorMode === "light" ? "icon.light" : "icon.dark"}
                >
                  {item.label}
                </Text>
              </VStack>
            );
          })}

          <DarkModeToggle />
        </Flex>
      </Flex>
    </Flex>
  );
};
