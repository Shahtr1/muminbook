import { Flex } from '@chakra-ui/react';
import { ReadingsTree } from '@/components/suhuf/reading/ReadingsTree.jsx';
import { ResourcesTree } from '@/components/explorer/components/ResourcesTree.jsx';
import { useOpenFile } from '@/hooks/suhuf/useOpenFile.js';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const ExplorerSidebar = () => {
  const { id: suhufId } = useParams();

  const openFile = useOpenFile(suhufId);
  return (
    <Flex flexDir="column">
      <ReadingsTree
        onSelect={(fileId) => {
          openFile(fileId);
        }}
      />
      <ResourcesTree
        onSelect={(path) => console.log('path', path)}
        windowMode
      />
    </Flex>
  );
};
