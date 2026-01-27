import { Flex, IconButton, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResourcesTree } from '@/components/explorer/components/ResourcesTree.jsx';
import { ResourcesTrash } from '@/components/explorer/components/ResourcesTrash.jsx';
import { ResourcesOverview } from '@/components/explorer/components/ResourcesOverview.jsx';
import { LuMenu } from 'react-icons/lu';
import { useState } from 'react';
import { useReadingLayoutConfig } from '@/hooks/reading/useReadingLayoutConfig.js';

export const ExplorerSidebar = ({ overview }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.300');

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const { sidebarWidth, totalHeaderOffset, breadcrumbHeight } =
    useReadingLayoutConfig();

  const currentPath =
    location.pathname.replace(/^\/reading\//, '') || 'my-files';

  return (
    <>
      <IconButton
        icon={<LuMenu fontSize="20px" />}
        aria-label="Toggle Sidebar"
        onClick={toggleSidebar}
        position="fixed"
        left={isSidebarOpen ? sidebarWidth : '5px'}
        zIndex={10}
        size="xs"
        variant="ghost"
        borderRadius="sm"
      />

      <Flex
        h={`calc(100dvh - ${totalHeaderOffset}px)`}
        minH={`calc(100dvh - ${totalHeaderOffset}px)`}
        top={`${breadcrumbHeight}px`}
        position="sticky"
        w={sidebarWidth}
        minW={sidebarWidth}
        maxW={sidebarWidth}
        p={2}
        borderRightWidth="1px"
        borderColor={borderColor}
        flexDir="column"
        zIndex={100}
        gap={2}
        ml={isSidebarOpen ? 0 : `-${sidebarWidth}`}
        transition="margin-left 0.3s ease-in-out"
      >
        <ResourcesTrash />
        <ResourcesOverview overview={overview} />
        <Flex overflow="auto" py={1}>
          <ResourcesTree
            activePath={currentPath}
            onSelect={(path) => navigate(`/reading/${path}`)}
          />
        </Flex>
      </Flex>
    </>
  );
};
