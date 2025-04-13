import { useMutation } from "@tanstack/react-query";
import { useXToast } from "@/hooks/useXToast.js";
import { createSuhuf } from "@/lib/services/suhuf.service.js";

export const useCreateSuhuf = () => {
  const toast = useXToast();

  return useMutation({
    mutationFn: async (data) => {
      toast.startLoading("Creating Suhuf...");
      return await createSuhuf(data);
    },
    onSuccess: (data) => {
      toast.success("Suhuf created.");
    },
    onError: toast.error,
    onSettled: toast.stopLoading,
  });
};
