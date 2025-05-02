import { Box, useBreakpointValue, useColorMode } from "@chakra-ui/react";
import Split from "react-split";
import { useMonaco } from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { defineMbTheme } from "@/theme/monacoTheme.js";
import { useParams } from "react-router-dom";
import { DefaultPanel } from "@/components/layout/suhuf/DefaultPanel.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDefaultSidebarState } from "@/components/layout/sidebar/getDefaultSidebarState.js";

export const SuhufPanel = ({ value, onValueChange }) => {
  const { colorMode } = useColorMode();
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();

  const { data: suhufState = getDefaultSidebarState() } = useQuery({
    queryKey: ["suhufState", suhufId],
    queryFn: () => {
      const state =
        queryClient.getQueryData(["suhufState", suhufId]) ??
        getDefaultSidebarState();
      // Ensure panelSizes exists in state
      return {
        ...getDefaultSidebarState(),
        ...state,
        panelSizes: state.panelSizes || [75, 25],
      };
    },
    staleTime: Infinity,
  });

  const isSecondPanelOpen = suhufState.rightTabOpen;
  const isSmallScreen = useBreakpointValue({ base: true, sm: false }) || false;
  const monaco = useMonaco();
  const [themeReady, setThemeReady] = useState(false);
  const [sizes, setSizes] = useState(suhufState.panelSizes || [75, 25]);

  useEffect(() => {
    if (monaco) {
      defineMbTheme(monaco, colorMode);
      setThemeReady(true);
    }
  }, [monaco, colorMode]);

  // Handle panel state changes
  useEffect(() => {
    if (isSecondPanelOpen) {
      // When opening, use saved sizes from suhufState
      setSizes(suhufState.panelSizes || [75, 25]);
    } else {
      // When closing, maintain first panel's size
      setSizes([sizes[0]]);
    }
  }, [isSecondPanelOpen, suhufState.panelSizes]);

  const renderEditor = () => <DefaultPanel suhufId={suhufId} />;

  const children = useMemo(() => {
    const panels = [
      <Box key="panel-1" h="100%" w="100%">
        {themeReady && renderEditor()}
      </Box>,
    ];

    if (isSecondPanelOpen) {
      panels.push(
        <Box key="panel-2" h="100%" w="100%">
          {themeReady && renderEditor()}
        </Box>,
      );
    }

    return panels;
  }, [themeReady, isSecondPanelOpen, suhufId]);

  return (
    <Split
      key={`${isSmallScreen ? "vertical" : "horizontal"}-${
        isSecondPanelOpen ? "two-panels" : "one-panel"
      }`}
      direction={isSmallScreen ? "vertical" : "horizontal"}
      sizes={isSecondPanelOpen ? sizes : [100]}
      minSize={200}
      gutterSize={3}
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: isSmallScreen ? "column" : undefined,
      }}
      onDragEnd={(newSizes) => {
        if (isSecondPanelOpen) {
          setSizes(newSizes);
          queryClient.setQueryData(["suhufState", suhufId], (prev = {}) => ({
            ...prev,
            panelSizes: newSizes,
          }));
        }
      }}
    >
      {children}
    </Split>
  );
};
