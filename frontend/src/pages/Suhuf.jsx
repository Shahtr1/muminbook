import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useWindowNavbar } from "@/context/WindowNavbarContext.jsx";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { Flex } from "@chakra-ui/react";

export const Suhuf = () => {
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();
  const { setNavbarChildren } = useWindowNavbar();

  const { data: suhuf, isLoading, isError } = useSuhuf(suhufId);

  const navbarContent = () => {
    return (
      <Flex width="100%" justify="end">
        {/*TODO: Add actions*/}
      </Flex>
    );
  };

  queryClient.setQueryData(["windowMode"], true);

  useEffect(() => {
    queryClient.setQueryData(["windowMode"], true);
    setNavbarChildren(navbarContent);

    return () => {
      queryClient.setQueryData(["windowMode"], false);
      setNavbarChildren(null);
    };
  }, []);

  return <div>Suhuf</div>;
};
