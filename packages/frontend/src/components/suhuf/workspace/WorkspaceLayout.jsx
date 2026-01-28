import { Flex, useColorMode } from '@chakra-ui/react';
import Split from 'react-split';
import { WorkspaceSplitView } from './WorkspaceSplitView.jsx';
import { WorkspaceSidebar } from '@/components/suhuf/workspace/WorkspaceSidebar.jsx';
import { BottomPanelWithHeader } from '@/components/suhuf/workspace/BottomPanelWithHeader.jsx';
import { BottomPanelHeader } from '@/components/suhuf/workspace/BottomPanelHeader.jsx';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';

export const WorkspaceLayout = ({ readings }) => {
  const { colorMode } = useColorMode();

  const { layout } = useSuhufWorkspaceContext();

  const isBottomOpen = layout?.isBottomTabOpen;

  const sizes = isBottomOpen ? [75, 25] : [100];

  return (
    <Flex h="100%" w="100%" pos="relative" zIndex={1}>
      <WorkspaceSidebar />

      {/* Main Content Area */}
      <Flex flex="1" display="flex" flexDirection="column" overflow="auto">
        <Split
          key={`with-bottom-open-${isBottomOpen}`}
          direction="vertical"
          sizes={sizes}
          minSize={isBottomOpen ? [200, 100] : [200]}
          gutterSize={3}
          className={colorMode === 'dark' ? 'gutter-dark' : 'gutter-light'}
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Main Panel */}
          <Flex overflowY="auto" position="relative">
            <WorkspaceSplitView />
          </Flex>

          {isBottomOpen ? (
            <BottomPanelWithHeader readings={readings} />
          ) : (
            <div />
          )}
        </Split>
        {/* TODO: A workaround for now, to toggle SuhufBottomPanel Body, fix it, when pro people will work on this */}
        {!isBottomOpen && <BottomPanelHeader readings={readings} />}
      </Flex>
    </Flex>
  );
};
