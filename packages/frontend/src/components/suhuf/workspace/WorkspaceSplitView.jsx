import { Box } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Split from 'react-split';

import { useHandleSplitPanelSizes } from '@/hooks/suhuf/useHandleSplitPanelSizes.js';
import { ReadingViewPanel } from '@/components/suhuf/panels/ReadingViewPanel.jsx';
import { EditorViewPanel } from '@/components/suhuf/panels/EditorViewPanel.jsx';
import { WelcomePanel } from '@/components/suhuf/panels/WelcomePanel.jsx';
import { Loader } from '@/components/layout/Loader.jsx';
import { useSafeBreakpointValue } from '@/hooks/useSafeBreakpointValue.js';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';

export const WorkspaceSplitView = () => {
  const { suhuf, layout, panels, updatePanels, updateLayout } =
    useSuhufWorkspaceContext();

  const isSmallScreen =
    useSafeBreakpointValue({ base: true, sm: false }) || false;

  const isSecondPanelOpen = layout?.isSplit;

  const [activePanelIndex, setActivePanelIndex] = useState(0);

  /**
   * Sync active index from server state
   */
  useEffect(() => {
    const activeIndex = panels.findIndex((p) => p.active);
    if (activeIndex >= 0) {
      setActivePanelIndex(activeIndex);
    }
  }, [panels]);

  /**
   * Handle split sizes using layout from context
   */
  const { sizes, handleResize } = useHandleSplitPanelSizes({
    layout,
    isSecondPanelOpen,
    onUpdateLayout: updateLayout,
  });

  /**
   * Activate panel
   */
  const handlePanelClick = useCallback(
    (index) => {
      if (index === activePanelIndex) return;

      setActivePanelIndex(index);

      const updatedPanels = panels.map((panel, i) => ({
        ...panel,
        active: i === index,
      }));

      updatePanels(updatedPanels);
    },
    [activePanelIndex, panels, updatePanels]
  );

  /**
   * Render content
   */
  const renderPanelContent = (panel, index) => {
    const direction = index === 0 ? 'left' : 'right';

    switch (panel?.fileType) {
      case 'reading':
        return (
          <ReadingViewPanel
            id={panel.fileId}
            panel={panel}
            direction={direction}
            suhuf={suhuf}
          />
        );

      case 'user':
        return <EditorViewPanel />;

      default:
        return <WelcomePanel suhuf={suhuf} />;
    }
  };

  /**
   * Memoized panel elements
   */
  const panelElements = useMemo(() => {
    if (!panels.length) return [];

    const renderPanel = (index) => {
      const panel = panels[index];
      const isActive = index === activePanelIndex;

      return (
        <Box
          key={`panel-${index}`}
          h="100%"
          w="100%"
          borderTop={isActive ? '2px solid' : 'none'}
          borderColor="brand.500"
          onClick={() => handlePanelClick(index)}
        >
          {renderPanelContent(panel, index)}
        </Box>
      );
    };

    const elements = [renderPanel(0)];

    if (isSecondPanelOpen && panels.length > 1) {
      elements.push(renderPanel(1));
    }

    return elements;
  }, [panels, activePanelIndex, isSecondPanelOpen, handlePanelClick, suhuf]);

  /**
   * Guard: wait until sizes are ready
   */
  const isSplitReady =
    !isSecondPanelOpen ||
    (sizes.length === 2 && sizes.every((s) => typeof s === 'number'));

  if (!isSplitReady) {
    return <Loader />;
  }

  return (
    <Split
      key={`${isSmallScreen ? 'vertical' : 'horizontal'}-${
        isSecondPanelOpen ? 'two' : 'one'
      }`}
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
