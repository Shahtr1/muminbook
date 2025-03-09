import useAuth from "../../hooks/useAuth.js";
import { Box } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar/Navbar.jsx";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";

export const AppContainer = () => {
  const { user, isLoading, isError } = useAuth();
  if (isError) return <SomethingWentWrong height="100vh" />;
  return isLoading ? (
    <Loader height="100vh" />
  ) : user ? (
    <Box minH="100vh" pt="navbar-height">
      <Navbar />
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
