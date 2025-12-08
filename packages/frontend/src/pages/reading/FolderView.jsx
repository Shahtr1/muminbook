import {
  Alert,
  AlertIcon,
  Flex,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Folder } from '@/components/layout/reading/resources/Folder.jsx';
import { File } from '@/components/layout/reading/resources/File.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { Loader } from '@/components/layout/Loader.jsx';
import { useResources } from '@/hooks/resource/useResources.js';
import { useTrashResource } from '@/hooks/resource/trash/useTrashResource.js';

export const FolderView = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong />;

  return (
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
      <Flex
        flexWrap="wrap"
        gap={{ base: 5, sm: 12 }}
        p="10px 25px"
        overflow="visible"
      >
        {resources.map((res) => {
          const pathWithoutMyFiles = res.path?.replace(/^\/?my-files\//, '');

          if (res.type === 'folder' && res.name === 'lost+found' && res.empty) {
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
                  width={itemWidth}
                  folderPath={folderPath}
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
                onClick={() => {
                  // TODO: handle file open here
                }}
                width={itemWidth}
                resource={{ ...res, id: res._id }}
              />
              {isTrashView && (
                <Tooltip label={pathWithoutMyFiles} hasArrow placement="bottom">
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
  );
};
