import { Flex } from '@chakra-ui/react';
import { ReadingsTree } from '@/components/suhuf/reading/ReadingsTree.jsx';
import { ResourcesTree } from '@/components/explorer/components/ResourcesTree.jsx';
import { useSuhufContext } from '@/context/SuhufContext.jsx';

export const ExplorerSidebar = () => {
  const { openFile } = useSuhufContext();

  return (
    <Flex flexDir="column">
      <ReadingsTree
        onSelect={(fileId) => {
          openFile(fileId);
        }}
      />

      <ResourcesTree
        onSelect={(path) => {
          console.log('path', path);
        }}
        windowMode
      />
    </Flex>
  );
};
