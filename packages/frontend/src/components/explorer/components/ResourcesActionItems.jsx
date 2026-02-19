import { ActionItems } from '@/components/explorer/ActionItems.jsx';
import { useTogglePinResource } from '@/hooks/explorer/useTogglePinResource.js';
import { useCachedResource } from '@/hooks/explorer/useCachedResource.js';

export const ResourcesActionItems = ({
  resource,
  pathFromUrl,
  onRename,
  onMoveToTrash,
  onRestore,
  onDelete,
  onMove,
  onCopy,
}) => {
  const cachedResource = useCachedResource(resource._id, pathFromUrl);
  const current = cachedResource || resource;

  const { _id: id, type, pinned } = current;

  const { mutate: togglePinResource } = useTogglePinResource();

  const togglePin = () => {
    togglePinResource({ id, pinned });
  };

  return (
    <ActionItems
      variant="resources"
      type={type}
      pinned={pinned}
      onRename={() => onRename(current)}
      onMoveToTrash={() => onMoveToTrash(current)}
      onCopy={() => onCopy(current)}
      onMoveToFolder={() => onMove(current)}
      onRestore={() => onRestore(current)}
      onDelete={() => onDelete(current)}
      onPin={togglePin}
    />
  );
};
