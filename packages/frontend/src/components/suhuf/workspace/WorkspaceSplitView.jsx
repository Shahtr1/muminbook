import { Box } from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';
import Split from 'react-split';

import { useHandleSplitPanelSizes } from '@/hooks/suhuf/useHandleSplitPanelSizes.js';
import { ReadingViewPanel } from '@/components/suhuf/panels/ReadingViewPanel.jsx';
import { EditorViewPanel } from '@/components/suhuf/panels/EditorViewPanel.jsx';
import { WelcomePanel } from '@/components/suhuf/panels/WelcomePanel.jsx';
import { Loader } from '@/components/layout/Loader.jsx';
import { useSafeBreakpointValue } from '@/hooks/useSafeBreakpointValue.js';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import { PanelHeader } from '@/components/suhuf/panels/PanelHeader.jsx';

export const WorkspaceSplitView = () => {
  const { suhuf, layout, panels, updatePanels } = useSuhufWorkspaceContext();

  const isSmallScreen =
    useSafeBreakpointValue({ base: true, sm: false }) || false;

  const isSecondPanelOpen = layout?.isSplit;

  const { sizes, handleResize } = useHandleSplitPanelSizes({
    isSecondPanelOpen,
  });

  /**
   * Derive active index directly from panels
   * (removes need for local state + sync effect)
   */
  const activePanelIndex = useMemo(() => {
    return panels.findIndex((p) => p.active);
  }, [panels]);

  /**
   * Stable click handler
   */
  const handlePanelClick = useCallback(
    (index) => {
      if (index === activePanelIndex) return;

      updatePanels(
        panels.map((panel, i) => {
          const shouldBeActive = i === index;

          // Avoid recreating object if nothing changed
          if (panel.active === shouldBeActive) {
            return panel;
          }

          return { ...panel, active: shouldBeActive };
        })
      );
    },
    [activePanelIndex, panels, updatePanels]
  );

  /**
   * Panel renderer
   */
  const renderPanel = useCallback(
    (panel, index) => {
      const direction = index === 0 ? 'left' : 'right';
      const isActive = index === activePanelIndex;

      const showHeader = panel?.fileType === 'reading' && panel?.fileId;

      let content;

      switch (panel?.fileType) {
        case 'reading':
          content = (
            <ReadingViewPanel
              id={panel.fileId}
              panel={panel}
              direction={direction}
              suhuf={suhuf}
            />
          );
          break;

        case 'user':
          content = <EditorViewPanel />;
          break;

        default:
          content = <WelcomePanel suhuf={suhuf} />;
      }

      return (
        <Box
          key={`panel-${index}`}
          h="100%"
          w="100%"
          onClick={() => handlePanelClick(index)}
          borderTop="2px solid"
          borderTopColor={isActive ? 'brand.500' : 'transparent'}
          display="flex"
          flexDirection="column"
        >
          {showHeader && (
            <PanelHeader id={panel.fileId} direction={direction} />
          )}
          {content}
        </Box>
      );
    },
    [activePanelIndex, handlePanelClick, suhuf]
  );

  /**
   * Memoized panel elements
   */
  const panelElements = useMemo(() => {
    if (!panels.length) return [];

    const elements = [renderPanel(panels[0], 0)];

    if (isSecondPanelOpen && panels.length > 1) {
      elements.push(renderPanel(panels[1], 1));
    }

    return elements;
  }, [panels, isSecondPanelOpen, renderPanel]);

  /**
   * Guard split readiness
   */
  const isSplitReady =
    !isSecondPanelOpen ||
    (sizes.length === 2 && sizes.every((s) => typeof s === 'number'));

  if (!isSplitReady) return <Loader />;

  return (
    <Split
      key={isSecondPanelOpen ? 'split-2' : 'split-1'}
      direction={isSmallScreen ? 'vertical' : 'horizontal'}
      sizes={isSecondPanelOpen ? sizes : [100]}
      minSize={200}
      gutterSize={3}
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: isSmallScreen ? 'column' : undefined,
      }}
      onDragEnd={handleResize}
    >
      {panelElements}
    </Split>
  );
};
