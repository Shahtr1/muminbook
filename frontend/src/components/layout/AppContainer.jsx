import useAuth from "../../hooks/useAuth.js";
import { Box, Center, Spinner } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar.jsx";

export const AppContainer = () => {
  const { user, isLoading } = useAuth();
  return isLoading ? (
    <Center w="100vw" h="90vh" flexDir="column">
      <Spinner mb={4} />
    </Center>
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
