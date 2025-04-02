import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { XModal } from "@/components/layout/modals/XModal.jsx";
import { useCopyResource } from "@/hooks/resource/useCopyResource.js";

const TransferResourceModal = ({
  isOpen,
  onClose,
  isCopy = true,
  id,
  path,
}) => {
  const [destinationPath, setDestinationPath] = useState(path || "");
  const [errors, setErrors] = useState({});

  const { mutate: copyResource } = useCopyResource();

  useEffect(() => {
    if (isOpen) {
      setDestinationPath(path);
      setErrors({});
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!destinationPath.trim()) {
      setErrors({ destinationPath: "Path is required." });
      return;
    }

    if (isCopy) copyResource({ id, destinationPath });
    onClose();
  };

  const removeError = (field) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const footer = (
    <>
      <Button
        onClick={onClose}
        variant="ghost"
        mr={3}
        size={{ base: "sm", sm: "md" }}
      >
        Cancel
      </Button>
      <Button
        colorScheme="blue"
        onClick={handleSave}
        size={{ base: "sm", sm: "md" }}
      >
        {isCopy ? "Copy" : "Move"}
      </Button>
    </>
  );

  return (
    <XModal
      isOpen={isOpen}
      onClose={onClose}
      title={isCopy ? "Copy Resource" : "Move Resource"}
      footer={footer}
    >
      <FormControl id="destinationPath" isInvalid={!!errors?.destinationPath}>
        <FormLabel>Choose destination path:</FormLabel>
        <Input
          autoFocus
          value={destinationPath}
          onChange={(e) => {
            setDestinationPath(e.target.value);
            removeError("destinationPath");
          }}
          placeholder="Enter destination path"
          size={{ base: "sm", sm: "md" }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <FormErrorMessage>{errors?.destinationPath}</FormErrorMessage>
      </FormControl>
    </XModal>
  );
};

export default TransferResourceModal;
