import { Flex, useColorMode } from '@chakra-ui/react';
import Split from 'react-split';
import { SuhufPanel } from './SuhufPanel.jsx';
import { SuhufLeftSidebar } from '@/components/layout/suhuf/SuhufLeftSidebar.jsx';
import { SuhufBottomPanelWithHeader } from '@/components/layout/suhuf/bottomPanel/SuhufBottomPanelWithHeader.jsx';
import { SuhufBottomPanelHeader } from '@/components/layout/suhuf/bottomPanel/SuhufBottomPanelHeader.jsx';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const SuhufLayout = ({ readings }) => {
  const { colorMode } = useColorMode();
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();
  const { data: suhuf } = useQuery({
    queryKey: ['suhuf', suhufId],
    queryFn: () => queryClient.getQueryData(['suhuf', suhufId]),
  });

  const layout = suhuf?.config?.layout || {};
  const isBottomOpen = layout?.isBottomTabOpen;

  const sizes = isBottomOpen ? [75, 25] : [100];

  return (
    <Flex h="100%" w="100%" pos="relative" zIndex={1}>
      <SuhufLeftSidebar suhuf={suhuf} />

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
            <SuhufPanel />
          </Flex>

          {isBottomOpen ? (
            <SuhufBottomPanelWithHeader readings={readings} />
          ) : (
            <div />
          )}
        </Split>
        {/* TODO: A workaround for now, to toggle SuhufBottomPanel Body, fix it, when pro people will work on this */}
        {!isBottomOpen && <SuhufBottomPanelHeader readings={readings} />}
      </Flex>
    </Flex>
  );
};
