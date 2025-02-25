import { Flex, Image, useColorMode } from "@chakra-ui/react";
import { DarkModeToggle } from "@/components/layout/DarkModeToggle.jsx";
import { usePreloadImages } from "@/hooks/usePreloadImages";
import { navItems } from "@/data/navitems.js";
import { NavItem } from "./NavItem";

export const Navbar = () => {
  const { colorMode } = useColorMode();
  const preloadedImages = usePreloadImages(navItems);

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
            cursor="pointer"
          />
        </Flex>

        <Flex>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              images={preloadedImages[item.icon] || {}}
            />
          ))}
          <DarkModeToggle disableInteraction={true} />
        </Flex>
      </Flex>
    </Flex>
  );
};
