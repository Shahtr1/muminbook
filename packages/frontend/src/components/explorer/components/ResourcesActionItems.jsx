import { Text, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { ActionItems } from '@/components/explorer/ActionItems.jsx';
import RenameResourceModal from '@/components/layout/modals/RenameResourceModal.jsx';
import TransferResourceModal from '@/components/layout/modals/TransferResourceModal.jsx';
import ConfirmationModal from '@/components/layout/modals/ConfirmationModal.jsx';
import { useMoveToTrashResource } from '@/hooks/explorer/trash/useMoveToTrashResource.js';
import { useRestoreFromTrashResource } from '@/hooks/explorer/trash/useRestoreFromTrashResource.js';
import { useDeleteResource } from '@/hooks/explorer/trash/useDeleteResource.js';
import { useTogglePinResource } from '@/hooks/explorer/useTogglePinResource.js';
import { useCachedResource } from '@/hooks/explorer/useCachedResource.js';

export const ResourcesActionItems = ({ resource, pathFromUrl }) => {
  const cachedResource = useCachedResource(resource._id, pathFromUrl);
  const current = cachedResource || resource;

  const { _id: id, type, name, pinned } = current;
  const { mutate: trashResource } = useMoveToTrashResource();
  const { mutate: restoreFromTrashResource } = useRestoreFromTrashResource();
  const { mutate: deleteResource } = useDeleteResource();
  const { mutate: togglePinResource } = useTogglePinResource();

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

  const {
    isOpen: isRestoreOpen,
    onOpen: openRestoreModal,
    onClose: onCloseRestore,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: openDeleteModal,
    onClose: onCloseDelete,
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

  const handleRestore = () => {
    restoreFromTrashResource({ id, path: resource.path });
  };

  const handleDelete = () => {
    deleteResource(id);
  };

  const togglePin = () => {
    togglePinResource({ id, pinned });
  };

  return (
    <>
      <ActionItems
        variant="resources"
        type={type}
        pinned={pinned}
        onRename={openRenameModal}
        onMoveToTrash={openTrashModal}
        onCopy={handleCopy}
        onMoveToFolder={handleMove}
        onRestore={openRestoreModal}
        onDelete={openDeleteModal}
        onPin={togglePin}
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
        path={pathFromUrl}
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

      <ConfirmationModal
        isOpen={isRestoreOpen}
        onClose={onCloseRestore}
        title="Restore Resource"
        yesLabel="Restore"
        noLabel="Cancel"
        onSave={handleRestore}
      >
        <Text>Do you want to restore this resource?</Text>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={onCloseDelete}
        title="Delete Permanently"
        yesLabel="Delete"
        noLabel="Cancel"
        onSave={handleDelete}
        yesVariant="danger"
      >
        <Text>This action will permanently delete the resource.</Text>
      </ConfirmationModal>
    </>
  );
};
