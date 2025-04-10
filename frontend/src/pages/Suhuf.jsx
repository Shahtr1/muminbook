import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWindowNavbar } from "@/context/WindowNavbarContext.jsx";

export const Suhuf = () => {
  const queryClient = useQueryClient();
  const { setNavbarChildren } = useWindowNavbar();

  useEffect(() => {
    queryClient.setQueryData(["windowMode"], true);
    setNavbarChildren(<></>);

    return () => {
      queryClient.setQueryData(["windowMode"], false);
      setNavbarChildren(null);
    };
  }, []);

  return <>This is Suhuf</>;
};
