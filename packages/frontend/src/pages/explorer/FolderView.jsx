import {
  Alert,
  AlertIcon,
  Flex,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { Loader } from '@/components/layout/Loader.jsx';
import { useResources } from '@/hooks/explorer/useResources.js';
import { useTrashResource } from '@/hooks/explorer/trash/useTrashResource.js';
import { useMoveToTrashResource } from '@/hooks/explorer/trash/useMoveToTrashResource.js';
import { useRestoreFromTrashResource } from '@/hooks/explorer/trash/useRestoreFromTrashResource.js';
import { useDeleteResource } from '@/hooks/explorer/trash/useDeleteResource.js';
import { useMemo, useState } from 'react';
import RenameResourceModal from '@/components/layout/modals/RenameResourceModal.jsx';
import TransferResourceModal from '@/components/layout/modals/TransferResourceModal.jsx';
import { ResourceItem } from '@/components/explorer/components/ResourceItem.jsx';
import { useXModal } from '@/context/ModalContext.jsx';
import { NoMatchingResults } from '@/components/layout/NoMatchingResults.jsx';

export const FolderView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { confirm } = useXModal();

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
  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

  const filteredResources = useMemo(() => {
    if (!searchQuery) return resources;

    return resources.filter((resource) => {
      const searchableText = [resource?.name, resource?.path, resource?.type]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(searchQuery);
    });
  }, [resources, searchQuery]);

  const [selectedResource, setSelectedResource] = useState(null);
  const [transferMode, setTransferMode] = useState(null);

  const handleMoveToTrash = async (resource) => {
    const ok = await confirm({
      title: 'Move to Trash',
      body: 'Are you sure you want to move it to trash?',
      yesLabel: 'Yes',
      yesVariant: 'danger',
    });

    if (ok) {
      trashResource(resource._id);
    }
  };

  const handleRestore = async (resource) => {
    const ok = await confirm({
      title: 'Restore Resource',
      body: 'Do you want to restore this resource?',
      yesLabel: 'Restore',
    });

    if (ok) {
      restoreResource({
        id: resource._id,
        path: resource.path,
      });
    }
  };

  const handleDelete = async (resource) => {
    const ok = await confirm({
      title: 'Delete Permanently',
      body: 'This action will permanently delete the resource.',
      yesLabel: 'Delete',
      yesVariant: 'danger',
    });

    if (ok) {
      deleteResource(resource._id);
    }
  };

  const commonHandlers = {
    onRename: setSelectedResource,
    onMove: (r) => {
      setSelectedResource(r);
      setTransferMode('move');
    },
    onCopy: (r) => {
      setSelectedResource(r);
      setTransferMode('copy');
    },
    onMoveToTrash: handleMoveToTrash,
    onRestore: handleRestore,
    onDelete: handleDelete,
  };

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

        {searchQuery && filteredResources.length === 0 ? (
          <NoMatchingResults
            width="100%"
            height="100%"
            title="No matching files or folders"
            description="Try a different name."
          />
        ) : (
          <Flex flexWrap="wrap" gap={{ base: 5, sm: 12 }} p="10px 25px">
            {filteredResources.map((res) => {
              const pathWithoutMyFiles = res.path?.replace(
                /^\/?my-files\//,
                ''
              );

              if (
                res.type === 'folder' &&
                res.name === 'lost+found' &&
                res.empty
              ) {
                return null;
              }

              return (
                <Flex
                  flexDir="column"
                  key={res._id}
                  justify="center"
                  align="center"
                >
                  <ResourceItem
                    key={res._id}
                    resource={{ ...res, id: res._id }}
                    folderPath={folderPath}
                    width={itemWidth}
                    onClickFolder={() => {
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
                    {...commonHandlers}
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
        )}
      </Flex>

      {/* SINGLE GLOBAL MODALS */}

      <RenameResourceModal
        isOpen={!!selectedResource && !transferMode}
        onClose={() => setSelectedResource(null)}
        id={selectedResource?._id}
        type={selectedResource?.type}
        name={selectedResource?.name}
      />

      <TransferResourceModal
        isOpen={!!transferMode}
        onClose={() => {
          setSelectedResource(null);
          setTransferMode(null);
        }}
        id={selectedResource?._id}
        path={folderPath}
        isCopy={transferMode === 'copy'}
      />
    </>
  );
};
