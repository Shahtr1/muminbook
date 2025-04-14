import useAuth from "../../hooks/useAuth.js";
import { Flex, useTheme } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar/Navbar.jsx";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WindowNavbar } from "@/components/layout/navbar/WindowNavbar.jsx";
import { useWindowNavbar } from "@/context/WindowNavbarContext";
import { WinManager } from "@/components/layout/WinManager.jsx";
import { useState } from "react";

export const AppContainer = () => {
  const { user, isLoading, isError } = useAuth();
  const queryClient = useQueryClient();
  const { navbarChildren } = useWindowNavbar();
  const theme = useTheme();

  const [winManagerVisible, setWinManagerVisible] = useState(false);
  const [handleWindowClose, setHandleWindowClose] = useState(null);
  const [handleWindowMinimize, setHandleWindowMinimize] = useState(null);

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
    <Flex direction="column" minH="100vh" h="100vh" overflow="hidden">
      <Flex
        direction="column"
        minH={`calc(100vh - ${winManagerHeight}px)`}
        h={`calc(100vh - ${winManagerHeight}px)`}
        overflow="auto"
        pt={windowMode ? undefined : "navbar-height"}
      >
        {windowMode ? (
          <WindowNavbar
            onClose={(id) => setHandleWindowClose(id)}
            onMinimize={(id) => setHandleWindowMinimize(id)}
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
