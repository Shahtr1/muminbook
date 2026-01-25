import { Box } from '@chakra-ui/react';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';
import { useEffect, useMemo, useState } from 'react';
import { useHandleSplitPanelSizes } from '@/hooks/suhuf/useHandleSplitPanelSizes.js';
import { ReadingPanel } from '@/components/layout/suhuf/ReadingPanel.jsx';
import { EditorPanel } from '@/components/layout/suhuf/EditorPanel.jsx';
import { DefaultPanel } from '@/components/layout/suhuf/DefaultPanel.jsx';
import Split from 'react-split';
import { Loader } from '@/components/layout/Loader.jsx';
import { useParams } from 'react-router-dom';
import { useSuhuf } from '@/hooks/suhuf/useSuhuf.js';
import { useSafeBreakpointValue } from '@/hooks/useSafeBreakpointValue.js';

export const SuhufPanel = () => {
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);

  const isSmallScreen =
    useSafeBreakpointValue({ base: true, sm: false }) || false;

  const layout = suhuf?.config?.layout || {};
  const panels = suhuf?.config?.panels || [];
  const isSecondPanelOpen = layout.isSplit;

  const [activePanelIndex, setActivePanelIndex] = useState(0);

  useEffect(() => {
    const activeIndex = panels.findIndex((p) => p.active);
    if (activeIndex >= 0) {
      setActivePanelIndex(activeIndex);
    }
  }, [panels]);

  const { sizes, handleResize } = useHandleSplitPanelSizes({
    layout,
    isSecondPanelOpen,
    onUpdateLayout: updateConfig,
  });

  const handlePanelClick = (index) => {
    if (index === activePanelIndex) return;

    setActivePanelIndex(index);

    const updatedPanels = panels.map((panel, i) => ({
      ...panel,
      active: i === index,
    }));

    updateConfig({ panels: updatedPanels });
  };

  const renderPanelContent = (panel) => {
    switch (panel?.fileType) {
      case 'reading':
        return <ReadingPanel id={panel.fileId} panel={panel} />;
      case 'user':
        return <EditorPanel />;
      default:
        return <DefaultPanel suhuf={suhuf} />;
    }
  };

  const panelElements = useMemo(() => {
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
          {renderPanelContent(panel)}
        </Box>
      );
    };

    const elements = [renderPanel(0)];
    if (isSecondPanelOpen && panels.length > 1) {
      elements.push(renderPanel(1));
    }

    return elements;
  }, [isSecondPanelOpen, activePanelIndex, panels, suhuf]);

  const isSplitReady =
    !isSecondPanelOpen ||
    (sizes.length === 2 && sizes.every((s) => typeof s === 'number'));

  if (!isSplitReady) {
    return <Loader />;
  }

  return (
    <Split
      key={`${isSmallScreen ? 'vertical' : 'horizontal'}-${isSecondPanelOpen ? 'two' : 'one'}`}
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
