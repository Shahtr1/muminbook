import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useWindowNavbar } from "@/context/WindowNavbarContext.jsx";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";

export const Suhuf = () => {
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();
  const { setNavbarChildren } = useWindowNavbar();

  const { data: suhuf, isLoading, isError } = useSuhuf(suhufId);

  // Setup window mode + navbar
  useEffect(() => {
    queryClient.setQueryData(["windowMode"], true);
    setNavbarChildren(<></>);
    return () => {
      queryClient.setQueryData(["windowMode"], false);
      setNavbarChildren(null);
    };
  }, []);

  return <div>Suhuf</div>;
};
