import { Folder } from '@/components/explorer/components/Folder.jsx';
import { File } from '@/components/explorer/components/File.jsx';

export const ResourceItem = ({
  resource,
  folderPath,
  width,
  onClickFolder,
  onClickFile,
  ...handlers
}) => {
  if (resource.type === 'folder') {
    return (
      <Folder
        resource={resource}
        width={width}
        folderPath={folderPath}
        onClick={onClickFolder}
        {...handlers}
      />
    );
  }
  return (
    <File
      resource={resource}
      width={width}
      folderPath={folderPath}
      onClick={onClickFile}
      {...handlers}
    />
  );
};
