import { useMutation } from "@tanstack/react-query";
import queryClient from "@/config/queryClient.js";
import { useNavigate } from "react-router-dom";
import { useXToast } from "@/hooks/useXToast.js";
import { deleteWindow } from "@/lib/services/index.js";

export const useCloseWindow = () => {
  const toast = useXToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ windowId, cleanupApi }) => {
      await deleteWindow(windowId);
      if (cleanupApi) await cleanupApi();
    },
    onSuccess: () => {
      queryClient.removeQueries(["currentWindowId"]);
      queryClient.setQueryData(["windowMode"], false);
      toast.success("Window closed.");
      navigate("/features");
    },
    onError: toast.error,
  });
};
