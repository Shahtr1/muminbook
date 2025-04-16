import useAuth from "../../hooks/useAuth.js";
import { Flex, useColorModeValue, useTheme } from "@chakra-ui/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar/Navbar.jsx";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WindowNavbar } from "@/components/layout/navbar/WindowNavbar.jsx";
import { useWindowNavbar } from "@/context/WindowNavbarContext";
import { WinManager } from "@/components/layout/WinManager.jsx";
import { useEffect, useState } from "react";
import { updateNavigationPath } from "@/utils/updateNavigationPath.js";

export const AppContainer = () => {
  const { user, isLoading, isError } = useAuth();
  const queryClient = useQueryClient();
  const { navbarChildren } = useWindowNavbar();
  const theme = useTheme();
  const location = useLocation();
  const windowBgColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );

  const [winManagerVisible, setWinManagerVisible] = useState(false);
  const [handleWindowClose, setHandleWindowClose] = useState(null);
  const [handleWindowMinimize, setHandleWindowMinimize] = useState(null);

  useEffect(() => {
    updateNavigationPath(location.pathname);
  }, [location.pathname]);

  const winManagerHeight = winManagerVisible
    ? parseInt(theme.space["win-manager-height"])
    : 0;

  const { data: windowMode } = useQuery({
    queryKey: ["windowMode"],
    queryFn: () => queryClient.getQueryData(["windowMode"]) || false,
    staleTime: 0,
  });

  if (isError) return <SomethingWentWrong height="100vh" />;
  if (isLoading) return <Loader height="100vh" />;

  return user ? (
    <Flex
      direction="column"
      minH="100vh"
      h="100vh"
      overflow="hidden"
      backgroundColor={windowMode ? windowBgColor : "unset"}
    >
      <Flex
        direction="column"
        minH={`calc(100vh - ${winManagerHeight}px)`}
        h={`calc(100vh - ${winManagerHeight}px)`}
        overflow="auto"
        pt={windowMode ? undefined : "navbar-height"}
      >
        {windowMode ? (
          <WindowNavbar
            onClose={(id) => {
              setHandleWindowClose(id);
              setTimeout(() => setHandleWindowClose(null), 100);
            }}
            onMinimize={(id) => {
              setHandleWindowMinimize(id);
              // Reset after short delay to allow re-minimize of same tab
              setTimeout(() => setHandleWindowMinimize(null), 100);
            }}
          >
            {navbarChildren}
          </WindowNavbar>
        ) : (
          <Navbar />
        )}
        <Flex flex="1">
          <Outlet />
        </Flex>
      </Flex>

      <WinManager
        onEmpty={(isEmpty) => setWinManagerVisible(!isEmpty)}
        closeWindowId={handleWindowClose}
        minimizeWindowId={handleWindowMinimize}
      />
    </Flex>
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ redirectUrl: window.location.pathname }}
    />
  );
};
