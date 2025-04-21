import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWindowNavbar } from "@/context/WindowNavbarContext.jsx";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { Flex, useColorModeValue, useToken } from "@chakra-ui/react";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { EditorLayout } from "@/components/layout/editor/EditorLayout.jsx";
import { SidebarLeftSVG } from "@/components/svgs/sidebar/SidebarLeftSVG.jsx";
import { SidebarBottomSVG } from "@/components/svgs/sidebar/SidebarBottomSVG.jsx";
import { SidebarRightSVG } from "@/components/svgs/sidebar/SidebarRightSVG.jsx";
import { getDefaultSidebarState } from "@/components/layout/sidebar/getDefaultSidebarState.js";

export const Suhuf = () => {
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();
  const { setNavbarChildren } = useWindowNavbar();
  const tokenKey = useColorModeValue("wn.bold.light", "wn.bold.dark");
  const [iconActiveColor] = useToken("colors", [tokenKey]);

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
      <Flex width="100%" justify="end" gap={1}>
        <div onClick={() => handleClick("left")}>
          <SidebarLeftSVG activeColor={iconActiveColor} active={leftTabOpen} />
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
    );
  }, [leftTabOpen, bottomTabOpen, rightTabOpen, iconActiveColor, handleClick]);

  useEffect(() => {
    queryClient.setQueryData(["windowMode"], true);
    setNavbarChildren(navbarContent);

    return () => {
      queryClient.setQueryData(["windowMode"], false);
      setNavbarChildren(null);
    };
  }, [navbarContent, queryClient, setNavbarChildren]);

  return (
    <Flex h="100%" w="100%" overflow="hidden">
      {isPending && <Loader />}
      {isError && <SomethingWentWrong />}
      {isSuccess && <EditorLayout />}
    </Flex>
  );
};
