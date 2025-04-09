import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const Suhuf = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(["windowMode"], true);

    return () => {
      queryClient.setQueryData(["windowMode"], false);
    };
  }, []);
  return <>This is Suhuf</>;
};
