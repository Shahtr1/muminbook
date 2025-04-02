import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";
import { XModal } from "@/components/layout/modals/XModal.jsx";

const TransferResourceModal = ({ isOpen, onClose, isCopy = true }) => {
  const [newName, setNewName] = useState("");

  const handleSave = () => {
    onClose();
  };

  const footer = (
    <>
      <Button onClick={onClose} variant="ghost" mr={3}>
        Cancel
      </Button>
      <Button colorScheme="blue" onClick={handleSave}>
        Save
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
      <FormControl>
        <FormLabel>New Name</FormLabel>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new name"
          autoFocus
        />
      </FormControl>
    </XModal>
  );
};

export default TransferResourceModal;
