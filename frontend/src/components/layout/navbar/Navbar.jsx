import { Flex, Image, useColorMode } from "@chakra-ui/react";
import { DarkModeToggle } from "@/components/layout/DarkModeToggle.jsx";
import { BellSVG } from "@/components/svgs/BellSVG.jsx";
import { NavItem } from "@/components/layout/navbar/NavItem.jsx";
import { DashboardSVG } from "@/components/svgs/DashboardSVG.jsx";
import { ReadingSVG } from "@/components/svgs/ReadingSVG.jsx";
import { MaleSVG } from "@/components/svgs/MaleSVG.jsx";
import { FemaleSVG } from "@/components/svgs/FemaleSVG.jsx";
import useAuth from "@/hooks/useAuth.js";

export const Navbar = () => {
  const { user } = useAuth();
  const { colorMode } = useColorMode();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (active) => <DashboardSVG active={active} />,
      link: "/dashboard",
    },
    {
      id: "reading",
      label: "Reading",
      icon: (active) => <ReadingSVG active={active} />,
      link: "/reading",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (active) => <BellSVG active={active} />,
      link: "#",
      active: true,
      dropdown: "notifications",
    },
    {
      id: "user",
      label: "Me",
      icon: (active) =>
        user.gender === "female" ? (
          <FemaleSVG active={active} />
        ) : (
          <MaleSVG active={active} />
        ),
      link: "#",
      dropdown: "user-menu",
    },
  ];

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
      <Flex justify="space-between" width="full" maxW="x-max-width" px={2}>
        <Flex align="center" height="100%">
          <Image
            w={150}
            src="/images/logo-with-image.png"
            alt="Muminbook Logo"
            cursor="pointer"
          />
        </Flex>

        <Flex h="100%">
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
          <DarkModeToggle disableInteraction={true} />
        </Flex>
      </Flex>
    </Flex>
  );
};
