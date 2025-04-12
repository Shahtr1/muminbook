import { useMutation } from "@tanstack/react-query";
import queryClient from "@/config/queryClient.js";
import { useXToast } from "@/hooks/useXToast.js";
import { createWindow } from "@/lib/services/index.js";

export const useCreateWindow = () => {
  const toast = useXToast();

  return useMutation({
    mutationFn: async ({ type, typeId }) => {
      toast.startLoading("Opening window...");
      return createWindow({ type, typeId });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentWindowId"], data._id);
      queryClient.setQueryData(["windowMode"], true);
      toast.success("Window created");
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
