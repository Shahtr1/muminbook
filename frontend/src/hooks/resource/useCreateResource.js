import { useMutation } from "@tanstack/react-query";
import { createResourceAPI } from "@/lib/services/api.js";
import queryClient from "@/config/queryClient.js";
import { useXToast } from "@/hooks/useXToast.js";

export const useCreateResource = () => {
  const { success, error } = useXToast();

  return useMutation({
    mutationFn: createResourceAPI,
    onSuccess: ({ type }, variables) => {
      const message = `${type === "file" ? "File" : "Folder"} created.`;
      success(message);
      queryClient.invalidateQueries({
        queryKey: ["resources", variables.path],
      });
    },
    onError: error,
  });
};
