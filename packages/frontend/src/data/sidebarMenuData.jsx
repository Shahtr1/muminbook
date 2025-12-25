import { BsFiles, BsSearch } from 'react-icons/bs';
import { ReadingsTree } from '@/components/layout/suhuf/ReadingsTree.jsx';
import { ResourcesTree } from '@/components/layout/reading/resources/ResourcesTree.jsx';
import { Flex } from '@chakra-ui/react';

export const sidebarMenuData = [
  {
    key: 'explorer',
    label: 'Explorer',
    icon: BsFiles,
    renderContent: () => (
      <Flex flexDir="column">
        <ReadingsTree onSelect={(path) => console.log('path', path)} />
        <ResourcesTree
          onSelect={(path) => console.log('path', path)}
          windowMode
        />
      </Flex>
    ),
    description:
      'Browse and manage your readings and resources — add, rename, or delete files and folders.',
  },
  {
    key: 'search',
    label: 'Search',
    icon: BsSearch,
    renderContent: () => <Flex>🔍 Search</Flex>,
    description:
      'Quickly search through your files, ayahs, or notes to find what you need.',
  },
  // ...Array.from({ length: 20 }).map((_, i) => ({
  //   key: `fake-tab-${i + 1}`,
  //   label: `Fake Tab ${i + 1}`,
  //   icon: i % 2 === 0 ? BsFiles : BsSearch,
  //   renderContent: () => (
  //     <Flex p={2}>📄 This is fake tab {i + 1} content.</Flex>
  //   ),
  //   description: `This is a placeholder description for Fake Tab ${i + 1}.`,
  // })),
];
