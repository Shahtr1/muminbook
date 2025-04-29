import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWindowNavbar } from "@/context/WindowNavbarContext.jsx";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import {
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
  useToken,
} from "@chakra-ui/react";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { SuhufLayout } from "@/components/layout/suhuf/SuhufLayout.jsx";
import { SidebarLeftSVG } from "@/components/svgs/sidebar/SidebarLeftSVG.jsx";
import { SidebarBottomSVG } from "@/components/svgs/sidebar/SidebarBottomSVG.jsx";
import { SidebarRightSVG } from "@/components/svgs/sidebar/SidebarRightSVG.jsx";
import { getDefaultSidebarState } from "@/components/layout/sidebar/getDefaultSidebarState.js";
import { ChevronDownIcon } from "@chakra-ui/icons";

export const Suhuf = () => {
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();
  const { setNavbarChildren } = useWindowNavbar();
  const tokenKey = useColorModeValue("wn.bold.light", "wn.bold.dark");
  const [iconActiveColor] = useToken("colors", [tokenKey]);
  const theme = useTheme();
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });

  const [leftTabOpen, setLeftTabOpen] = useState(false);
  const [rightTabOpen, setRightTabOpen] = useState(false);
  const [bottomTabOpen, setBottomTabOpen] = useState(false);

  const { data: suhuf, isPending, isSuccess, isError } = useSuhuf(suhufId);

  const { data: sidebarState = {} } = useQuery({
    queryKey: ["sidebarState", suhufId],
    queryFn: () =>
      queryClient.getQueryData(["sidebarState", suhufId]) ??
      getDefaultSidebarState(),
    staleTime: 0,
  });

  useEffect(() => {
    setLeftTabOpen(!!sidebarState.leftTabOpen);
    setRightTabOpen(!!sidebarState.rightTabOpen);
    setBottomTabOpen(!!sidebarState.bottomTabOpen);
  }, [sidebarState]);

  queryClient.setQueryData(["windowMode"], true);

  const handleClick = useCallback(
    (side) => {
      queryClient.setQueryData(["sidebarState", suhufId], (prev = {}) => {
        return {
          ...prev,
          [`${side}TabOpen`]: !prev?.[`${side}TabOpen`],
        };
      });
    },
    [queryClient, suhufId],
  );

  const navbarContent = useMemo(() => {
    return (
      <Flex width="100%" justify="space-between">
        <Menu isLazy placement="bottom">
          <MenuButton
            as={Flex}
            align="center"
            cursor="pointer"
            height="100%"
            sx={{
              "> span": {
                height: "100%",
              },
            }}
          >
            <Flex
              border={isSmallScreen ? "none" : "1px solid"}
              borderColor={borderColor}
              borderRadius="sm"
              cursor="pointer"
              align="center"
              justify="center"
              w={isSmallScreen ? "24px" : "auto"}
              h={isSmallScreen ? "24px" : "auto"}
              mr={1}
              p={isSmallScreen ? "0" : "1px"}
            >
              <Image
                src="/images/logos/suhuf-logo.png"
                alt="Suhuf Logo"
                w={5}
              />
              {!isSmallScreen && <Icon as={ChevronDownIcon} fontSize="12px" />}
            </Flex>
          </MenuButton>

          <MenuList
            p={{ base: 1, sm: 2 }}
            width="fit-content"
            sx={{
              button: {
                height: "auto",
                padding: "0",
              },
            }}
          >
            <Text></Text>
          </MenuList>
        </Menu>

        <Flex gap={1} align="center">
          <div onClick={() => handleClick("left")}>
            <SidebarLeftSVG
              activeColor={iconActiveColor}
              active={leftTabOpen}
            />
          </div>
          <div onClick={() => handleClick("bottom")}>
            <SidebarBottomSVG
              activeColor={iconActiveColor}
              active={bottomTabOpen}
            />
          </div>
          <div onClick={() => handleClick("right")}>
            <SidebarRightSVG
              activeColor={iconActiveColor}
              active={rightTabOpen}
            />
          </div>
        </Flex>
      </Flex>
    );
  }, [
    leftTabOpen,
    bottomTabOpen,
    rightTabOpen,
    iconActiveColor,
    handleClick,
    borderColor,
    isSmallScreen,
  ]);

  useEffect(() => {
    queryClient.setQueryData(["windowMode"], true);
    setNavbarChildren(navbarContent);

    return () => {
      queryClient.setQueryData(["windowMode"], false);
      setNavbarChildren(null);
    };
  }, [navbarContent, queryClient, setNavbarChildren]);

  const winNavbarHeight = "30px";

  return (
    <Flex
      h={`calc(100dvh - ${theme.sizes["win-manager-height"]} - ${winNavbarHeight}) `}
      w="100%"
      overflow="hidden"
    >
      {isPending && <Loader logoImg="suhuf-logo.png" />}
      {isError && <SomethingWentWrong />}
      {isSuccess && <SuhufLayout />}
    </Flex>
  );
};
