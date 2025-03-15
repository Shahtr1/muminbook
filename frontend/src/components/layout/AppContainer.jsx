import useAuth from "../../hooks/useAuth.js";
import { Box } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar/Navbar.jsx";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NavbarReadingMode } from "@/components/layout/navbar/NavbarReadingMode.jsx";

export const AppContainer = () => {
  const { user, isLoading, isError } = useAuth();
  const queryClient = useQueryClient();

  const [readingMode, setReadingMode] = useState(
    queryClient.getQueryData(["readingMode"]) || false,
  );

  useEffect(() => {
    const checkReadingMode = () => {
      setReadingMode(queryClient.getQueryData(["readingMode"]) || false);
    };

    checkReadingMode();

    const interval = setInterval(checkReadingMode, 100);

    return () => clearInterval(interval);
  }, []);

  if (isError) return <SomethingWentWrong height="100vh" />;

  return isLoading ? (
    <Loader height="100vh" />
  ) : user ? (
    <Box minH="100vh" pt={readingMode ? undefined : "navbar-height"}>
      {readingMode ? <NavbarReadingMode /> : <Navbar />}
      <Outlet />
    </Box>
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ redirectUrl: window.location.pathname }}
    />
  );
};
