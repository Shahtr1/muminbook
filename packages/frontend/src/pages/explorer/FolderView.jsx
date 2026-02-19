import {
  Alert,
  AlertIcon,
  Flex,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Folder } from '@/components/explorer/components/Folder.jsx';
import { File } from '@/components/explorer/components/File.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { Loader } from '@/components/layout/Loader.jsx';
import { useResources } from '@/hooks/explorer/useResources.js';
import { useTrashResource } from '@/hooks/explorer/trash/useTrashResource.js';
import { useMoveToTrashResource } from '@/hooks/explorer/trash/useMoveToTrashResource.js';
import { useRestoreFromTrashResource } from '@/hooks/explorer/trash/useRestoreFromTrashResource.js';
import { useDeleteResource } from '@/hooks/explorer/trash/useDeleteResource.js';
import ConfirmationModal from '@/components/layout/modals/ConfirmationModal.jsx';
import { useState } from 'react';
import RenameResourceModal from '@/components/layout/modals/RenameResourceModal.jsx';
import TransferResourceModal from '@/components/layout/modals/TransferResourceModal.jsx';

export const FolderView = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedResource, setSelectedResource] = useState(null);
  const [modalType, setModalType] = useState(null);

  const { mutate: trashResource } = useMoveToTrashResource();
  const { mutate: restoreResource } = useRestoreFromTrashResource();
  const { mutate: deleteResource } = useDeleteResource();

  const itemWidth = useBreakpointValue({ base: '70px', sm: '100px' });
  const originalPath = location.state?.originalPath;

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const isTrashView = location.pathname.includes('/reading/trash');
  const baseSegment = isTrashView ? 'trash' : 'my-files';
  const folderPathIndex = pathSegments.indexOf(baseSegment);
  const folderPath = pathSegments.slice(folderPathIndex).join('/');

  const { resources, isPending, isError } = isTrashView
    ? useTrashResource(folderPath, originalPath)
    : useResources(folderPath);

  const closeModal = () => {
    setModalType(null);
    setSelectedResource(null);
  };

  console.log('modalType:', modalType);

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong />;

  return (
    <>
      <Flex
        flexDir={isTrashView ? 'column' : 'row'}
        w="100%"
        height="fit-content"
        overflow="visible"
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {isTrashView && (
          <Flex px={3} w="95%" align="center" mt={1} mb={2} mx="auto">
            <Alert
              status="info"
              variant="left-accent"
              fontSize={{ base: '10px', sm: 'sm' }}
              h={{ base: '40px', sm: '50px' }}
            >
              <AlertIcon />
              <Text>
                Items in trash will be automatically deleted after 30 days
              </Text>
            </Alert>
          </Flex>
        )}

        <Flex flexWrap="wrap" gap={{ base: 5, sm: 12 }} p="10px 25px">
          {resources.map((res) => {
            const pathWithoutMyFiles = res.path?.replace(/^\/?my-files\//, '');

            if (
              res.type === 'folder' &&
              res.name === 'lost+found' &&
              res.empty
            ) {
              return null;
            }

            if (res.type === 'folder') {
              return (
                <Flex
                  flexDir="column"
                  key={res._id}
                  justify="center"
                  align="center"
                >
                  <Folder
                    width={itemWidth}
                    folderPath={folderPath}
                    resource={{ ...res, id: res._id }}
                    onClick={() => {
                      navigate(
                        `/reading/${baseSegment}/${[
                          ...pathSegments.slice(folderPathIndex + 1),
                          encodeURIComponent(res.name),
                        ].join('/')}`,
                        isTrashView
                          ? { state: { originalPath: res.path } }
                          : undefined
                      );
                    }}
                    onRename={(r) => {
                      setSelectedResource(r);
                      setModalType('rename');
                    }}
                    onMoveToTrash={(r) => {
                      setSelectedResource(r);
                      setModalType('trash');
                    }}
                    onRestore={(r) => {
                      setSelectedResource(r);
                      setModalType('restore');
                    }}
                    onDelete={(r) => {
                      setSelectedResource(r);
                      setModalType('delete');
                    }}
                    onMove={(r) => {
                      setSelectedResource(r);
                      setModalType('move');
                    }}
                    onCopy={(r) => {
                      setSelectedResource(r);
                      setModalType('copy');
                    }}
                  />

                  {isTrashView && (
                    <Tooltip
                      label={pathWithoutMyFiles}
                      hasArrow
                      placement="bottom"
                    >
                      <Text
                        fontSize={{ base: '9px', sm: '12px' }}
                        maxW={itemWidth}
                        overflowX="auto"
                        whiteSpace="nowrap"
                        pb={2}
                      >
                        {pathWithoutMyFiles}
                      </Text>
                    </Tooltip>
                  )}
                </Flex>
              );
            }

            return (
              <Flex
                flexDir="column"
                key={res._id}
                justify="center"
                align="center"
              >
                <File
                  folderPath={folderPath}
                  width={itemWidth}
                  resource={{ ...res, id: res._id }}
                />
                {isTrashView && (
                  <Tooltip
                    label={pathWithoutMyFiles}
                    hasArrow
                    placement="bottom"
                  >
                    <Text
                      fontSize={{ base: '9px', sm: '12px' }}
                      maxW={itemWidth}
                      overflowX="auto"
                      whiteSpace="nowrap"
                      pb={2}
                    >
                      {pathWithoutMyFiles}
                    </Text>
                  </Tooltip>
                )}
              </Flex>
            );
          })}
        </Flex>
      </Flex>

      {/* SINGLE GLOBAL MODALS */}

      <ConfirmationModal
        isOpen={modalType === 'trash'}
        onClose={closeModal}
        title="Move to Trash"
        yesLabel="Yes"
        noLabel="Cancel"
        yesVariant="danger"
        onSave={() => {
          trashResource(selectedResource?._id);
          closeModal();
        }}
      >
        <Text>Are you sure you want to move it to trash?</Text>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={modalType === 'restore'}
        onClose={closeModal}
        title="Restore Resource"
        yesLabel="Restore"
        noLabel="Cancel"
        onSave={() => {
          restoreResource({
            id: selectedResource?._id,
            path: selectedResource?.path,
          });
          closeModal();
        }}
      >
        <Text>Do you want to restore this resource?</Text>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        title="Delete Permanently"
        yesLabel="Delete"
        noLabel="Cancel"
        yesVariant="danger"
        onSave={() => {
          deleteResource(selectedResource?._id);
          closeModal();
        }}
      >
        <Text>This action will permanently delete the resource.</Text>
      </ConfirmationModal>

      <RenameResourceModal
        isOpen={modalType === 'rename'}
        onClose={closeModal}
        id={selectedResource?._id}
        type={selectedResource?.type}
        name={selectedResource?.name}
      />

      <TransferResourceModal
        isOpen={modalType === 'move' || modalType === 'copy'}
        onClose={closeModal}
        id={selectedResource?._id}
        path={folderPath}
        isCopy={modalType === 'copy'}
      />
    </>
  );
};
