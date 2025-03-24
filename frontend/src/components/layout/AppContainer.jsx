import useAuth from "../../hooks/useAuth.js";
import { Flex } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar/Navbar.jsx";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NavbarReadingMode } from "@/components/layout/navbar/NavbarReadingMode.jsx";

export const AppContainer = () => {
  const { user, isLoading, isError } = useAuth();
  const queryClient = useQueryClient();

  const { data: readingMode } = useQuery({
    queryKey: ["readingMode"],
    queryFn: () => queryClient.getQueryData(["readingMode"]) || false,
    staleTime: 0,
  });

  if (isError) return <SomethingWentWrong height="100vh" />;

  return isLoading ? (
    <Loader height="100vh" />
  ) : user ? (
    <Flex
      direction="column"
      minH="100vh"
      pt={readingMode ? undefined : "navbar-height"}
    >
      {readingMode ? <NavbarReadingMode /> : <Navbar />}
      <Flex flex="1">
        <Outlet />
      </Flex>
    </Flex>
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ redirectUrl: window.location.pathname }}
    />
  );
};
