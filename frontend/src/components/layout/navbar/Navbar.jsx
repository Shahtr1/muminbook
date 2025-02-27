import {
  Divider,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { DarkModeToggle } from "@/components/layout/DarkModeToggle.jsx";
import { BellSVG } from "@/components/svgs/BellSVG.jsx";
import { NavItem } from "@/components/layout/navbar/NavItem.jsx";
import { DashboardSVG } from "@/components/svgs/DashboardSVG.jsx";
import { ReadingSVG } from "@/components/svgs/ReadingSVG.jsx";
import { MaleSVG } from "@/components/svgs/MaleSVG.jsx";
import { FemaleSVG } from "@/components/svgs/FemaleSVG.jsx";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH } from "@/hooks/useAuth.js";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Search2Icon } from "@chakra-ui/icons";
import { FeaturesSVG } from "@/components/svgs/FeaturesSVG.jsx";
import { navigate } from "@/lib/services/navigation.js";

export const Navbar = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData([AUTH]);
  const { colorMode } = useColorMode();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchIconColor = useColorModeValue("gray.500", "whiteAlpha.700");
  const activeColor = useColorModeValue("text.primary", "white");

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isFocused) {
      searchInputRef.current?.focus();
    }
  }, [isFocused]);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: DashboardSVG,
      link: "/dashboard",
    },
    {
      id: "reading",
      label: "Reading",
      icon: ReadingSVG,
      link: "/reading",
    },
    {
      id: "features",
      label: "Features",
      icon: FeaturesSVG,
      link: "#",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: BellSVG,
      link: "#",
      dropdown: "notifications",
    },
    {
      id: "user",
      label: "Me",
      icon: user?.gender === "female" ? FemaleSVG : MaleSVG,
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
        <Flex align="center" height="100%" gap={2} flex={1}>
          <Image
            w={45}
            src="/images/logo-image.png"
            alt="Muminbook Logo"
            cursor="pointer"
            display={{ base: "block", md: "none" }}
            onClick={() => navigate("/")}
          />

          <Image
            w={150}
            src="/images/logo-with-image.png"
            alt="Muminbook Logo"
            cursor="pointer"
            display={{ base: "none", md: "block" }}
          />

          <InputGroup
            display={{ base: isFocused ? "flex" : "none", md: "flex" }}
            flex={{ base: 1, md: isFocused ? 1 : "0.5" }}
            transition="all 0.3s ease-in-out"
          >
            <InputLeftElement height="100%">
              <Search2Icon color={searchIconColor} />
            </InputLeftElement>
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              size="sm"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              transition="all 0.3s ease-in-out"
            />
          </InputGroup>
        </Flex>

        <Flex
          h="100%"
          display={{ base: isFocused ? "none" : "flex", md: "flex" }}
          align="center"
        >
          <Search2Icon
            w={{ base: "45px", sm: "65px" }}
            fontSize={25}
            color={searchIconColor}
            cursor="pointer"
            display={{ base: "block", md: "none" }}
            _hover={{ color: activeColor }}
            onClick={() => setIsFocused(true)}
          />

          {navItems.map((item) => {
            const isActive = location.pathname === item.link;
            return (
              <NavItem key={item.id} item={{ ...item, active: isActive }} />
            );
          })}
          <Divider
            orientation="vertical"
            h="100%"
            backgroundColor={
              colorMode === "light" ? "gray.300" : "whiteAlpha.300"
            }
          />
          <DarkModeToggle disableInteraction={true} navbar={true} />
        </Flex>
      </Flex>
    </Flex>
  );
};
