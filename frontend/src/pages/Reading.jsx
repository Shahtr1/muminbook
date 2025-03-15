import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const Reading = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(["readingMode"], true);

    return () => {
      queryClient.setQueryData(["readingMode"], false);
    };
  }, []);

  return <>Reading</>;
};
