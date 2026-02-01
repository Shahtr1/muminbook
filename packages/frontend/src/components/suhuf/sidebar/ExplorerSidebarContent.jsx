import { Flex } from '@chakra-ui/react';
import { ReadingsTree } from '@/components/suhuf/reading/ReadingsTree.jsx';
import { ResourcesTree } from '@/components/explorer/components/ResourcesTree.jsx';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';

export const ExplorerSidebarContent = () => {
  const { openFile } = useSuhufWorkspaceContext();

  return (
    <Flex flexDir="column">
      <ReadingsTree
        onSelect={(source) => {
          openFile(source);
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
