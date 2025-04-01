import { useToast } from "@chakra-ui/react";

export const useXToast = () => {
  const toast = useToast();

  const success = (message) => {
    toast({
      title: message,
      status: "success",
      position: "bottom",
      duration: 3000,
      isClosable: true,
    });
  };

  const error = (err) => {
    toast({
      title: err?.message ?? "Something went wrong!",
      status: "error",
      position: "bottom",
      duration: 3000,
      isClosable: true,
    });
  };

  return { success, error };
};
