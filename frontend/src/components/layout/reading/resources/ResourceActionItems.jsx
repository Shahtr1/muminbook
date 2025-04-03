import { Text, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { ActionItems } from "@/components/layout/reading/ActionItems.jsx";
import RenameResourceModal from "@/components/layout/modals/RenameResourceModal.jsx";
import TransferResourceModal from "@/components/layout/modals/TransferResourceModal.jsx";
import ConfirmationModal from "@/components/layout/modals/ConfirmationModal.jsx";
import { useTrashResource } from "@/hooks/resource/useTrashResource.js";

export const ResourceActionItems = ({ id, type, name, path }) => {
  const { mutate: trashResource } = useTrashResource();
  const {
    isOpen: isRenameOpen,
    onOpen: openRenameModal,
    onClose: onCloseRename,
  } = useDisclosure();

  const {
    isOpen: isTransferOpen,
    onOpen: openTransferModal,
    onClose: onCloseTransfer,
  } = useDisclosure();

  const {
    isOpen: isTrashOpen,
    onOpen: openTrashModal,
    onClose: onCloseTrash,
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

  const handleMoveToTrash = () => {
    trashResource(id);
  };

  return (
    <>
      <ActionItems
        variant="resources"
        onRename={openRenameModal}
        onMoveToTrash={openTrashModal}
        onCopy={handleCopy}
        onMoveToFolder={handleMove}
      />

      <RenameResourceModal
        isOpen={isRenameOpen}
        onClose={onCloseRename}
        id={id}
        type={type}
        name={name}
      />

      <TransferResourceModal
        isOpen={isTransferOpen}
        onClose={onCloseTransfer}
        isCopy={isCopyAction}
        id={id}
        path={path}
      />
      <ConfirmationModal
        isOpen={isTrashOpen}
        onClose={onCloseTrash}
        title="Move to Trash"
        yesLabel="Yes"
        noLabel="No"
        onSave={handleMoveToTrash}
        yesVariant="danger"
      >
        <Text>Are you sure you want to move it to trash?</Text>
      </ConfirmationModal>
    </>
  );
};
