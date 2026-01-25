import { Flex } from '@chakra-ui/react';
import { ReadingsTree } from '@/components/layout/suhuf/ReadingsTree.jsx';
import { ResourcesTree } from '@/components/layout/reading/resources/ResourcesTree.jsx';

export const ExplorerPanel = () => {
  return (
    <Flex flexDir="column">
      <ReadingsTree onSelect={(path) => console.log('path', path)} />
      <ResourcesTree
        onSelect={(path) => console.log('path', path)}
        windowMode
      />
    </Flex>
  );
};
