import { useToast } from "@chakra-ui/react";
import { useRef } from "react";

export const useXToast = () => {
  const toast = useToast();
  const toastIdRef = useRef();

  const success = (message) => {
    stopLoading();
    toast({
      title: message,
      status: "success",
      position: "bottom",
      duration: 3000,
      isClosable: true,
    });
  };

  const error = (err) => {
    stopLoading();
    toast({
      title: err?.message ?? "Something went wrong!",
      status: "error",
      position: "bottom",
      duration: 3000,
      isClosable: true,
    });
  };

  const startLoading = (message = "Processing...") => {
    if (!toastIdRef.current) {
      toastIdRef.current = toast({
        title: message,
        status: "loading",
        position: "bottom",
        isClosable: false,
        duration: null,
      });
    }
  };

  const stopLoading = () => {
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
      toastIdRef.current = null;
    }
  };

  const notify = (isPending, isSuccess, isError, message = "Processing...") => {
    if (isPending) startLoading(message);
    if (isSuccess || isError) stopLoading();
  };

  return {
    success,
    error,
    startLoading,
    stopLoading,
    notify,
  };
};
