import { Flex, useColorMode } from '@chakra-ui/react';
import Split from 'react-split';
import { SuhufPanel } from './panels/SuhufPanel.jsx';
import { SuhufLeftSidebar } from '@/components/suhuf/leftSidebar/SuhufLeftSidebar.jsx';
import { SuhufBottomPanelWithHeader } from '@/components/suhuf/bottomPanel/SuhufBottomPanelWithHeader.jsx';
import { SuhufBottomPanelHeader } from '@/components/suhuf/bottomPanel/SuhufBottomPanelHeader.jsx';
import { useParams } from 'react-router-dom';
import { useSuhuf } from '@/hooks/suhuf/useSuhuf.js';

export const SuhufLayout = ({ readings, suhuf }) => {
  const { colorMode } = useColorMode();

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
            <SuhufPanel suhuf={suhuf} />
          </Flex>

          {isBottomOpen ? (
            <SuhufBottomPanelWithHeader readings={readings} suhuf={suhuf} />
          ) : (
            <div />
          )}
        </Split>
        {/* TODO: A workaround for now, to toggle SuhufBottomPanel Body, fix it, when pro people will work on this */}
        {!isBottomOpen && (
          <SuhufBottomPanelHeader readings={readings} suhuf={suhuf} />
        )}
      </Flex>
    </Flex>
  );
};
