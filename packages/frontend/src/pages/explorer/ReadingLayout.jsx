import { Outlet, useLocation } from 'react-router-dom';
import { ExplorerHeader } from '@/components/explorer/ExplorerHeader.jsx';
import { ExplorerToolbar } from '@/components/explorer/toolbar/ExplorerToolbar.jsx';
import { ExplorerSidebar } from '@/components/explorer/ExplorerSidebar.jsx';
import { Flex } from '@chakra-ui/react';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { useOverviewResource } from '@/hooks/resource/useOverviewResource.js';
import { Loader } from '@/components/layout/Loader.jsx';
import React from 'react';

export const ReadingLayout = () => {
  const location = useLocation();
  const { overview, isPending, isError } = useOverviewResource();
  const isFolderView =
    location.pathname.includes('/explorer/my-files') ||
    location.pathname.includes('/explorer/trash');

  return (
    <Flex
      flexDirection="column"
      pt={{
        base: 'reading-layout-padding-top-sm',
        sm: 'reading-layout-padding-top-lg',
      }}
      w="full"
    >
      {isPending && <Loader />}

      {isError && <SomethingWentWrong />}

      {!isPending && !isError && (
        <>
          <ExplorerHeader isFolderView={isFolderView} />
          <ExplorerToolbar />
          <Flex h="100%">
            {isFolderView && <ExplorerSidebar overview={overview} />}
            <Outlet />
          </Flex>
        </>
      )}
    </Flex>
  );
};
