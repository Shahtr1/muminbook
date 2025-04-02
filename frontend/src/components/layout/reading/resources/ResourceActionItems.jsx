import { useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { ActionItems } from "@/components/layout/reading/ActionItems.jsx";
import RenameResourceModal from "@/components/layout/modals/RenameResourceModal.jsx";
import TransferResourceModal from "@/components/layout/modals/TransferResourceModal.jsx";

export const ResourceActionItems = ({ id, type }) => {
  const {
    isOpen: isRenameOpen,
    onOpen: onOpenRename,
    onClose: onCloseRename,
  } = useDisclosure();

  const {
    isOpen: isTransferOpen,
    onOpen: openTransferModal,
    onClose: onCloseTransfer,
  } = useDisclosure();

  const [isCopyAction, setIsCopyAction] = useState(true);

  const handleCopy = () => {
    setIsCopyAction(true);
    openTransferModal();
  };

  const handleMove = () => {
    setIsCopyAction(false);
    openTransferModal();
  };

  return (
    <>
      <ActionItems
        variant="resources"
        onRename={onOpenRename}
        onCopy={handleCopy}
        onMoveToFolder={handleMove}
      />

      <RenameResourceModal isOpen={isRenameOpen} onClose={onCloseRename} />

      <TransferResourceModal
        isOpen={isTransferOpen}
        onClose={onCloseTransfer}
        isCopy={isCopyAction}
      />
    </>
  );
};
