import {
  Box,
  Flex,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import Split from "react-split";
import { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { defineMbTheme } from "@/theme/monacoTheme.js";
import { SuhufSVG } from "@/components/svgs/SuhufSVG.jsx";
import { sidebarTabs } from "@/data/sidebarTabs.jsx";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export const SuhufPanel = ({ value, onValueChange }) => {
  const { colorMode } = useColorMode();
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  const secondaryColor = useColorModeValue("wn.gutter.light", "wn.gutter.dark");
  const suhufLogoSize = useBreakpointValue({ base: "90px", sm: "130px" });
  const primaryColor = useColorModeValue("wn.icon.light", "wn.icon.dark");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false }) || false;
  const monaco = useMonaco();
  const [themeReady, setThemeReady] = useState(false);

  const selectedTheme =
    colorMode === "dark" ? "mb-theme-dark" : "mb-theme-light";

  useEffect(() => {
    if (monaco) {
      defineMbTheme(monaco, colorMode);
      setThemeReady(true);
    }
  }, [monaco, colorMode]);

  // Force re-mount when theme changes
  const editorKey = `editor-${selectedTheme}`;

  const toggleTab = (tabKey) => {
    queryClient.setQueryData(["sidebarState", suhufId], (prev = {}) => {
      const isSameTab = prev.leftTab === tabKey;
      return {
        ...prev,
        leftTab: tabKey,
        leftTabOpen: isSameTab ? !prev.leftTabOpen : true,
      };
    });
  };

  const noSelectionPane = () => (
    <Flex
      height="100%"
      bgColor={bgColor}
      justify="center"
      align="center"
      flexDir="column"
    >
      <SuhufSVG dimensions={suhufLogoSize} activeColor={secondaryColor} />
      <Text
        fontSize={{ base: "17px", sm: "22px" }}
        fontWeight="semibold"
        color={secondaryColor}
        overflow="hidden"
        mb={2}
        align="center"
      >
        Welcome to Suhuf
      </Text>
      <Flex w="80%" flexDir="column">
        <Text fontSize={{ base: "15px", sm: "18px" }} color={primaryColor}>
          Built for seekers.
        </Text>
        <Text
          fontSize={{ base: "15px", sm: "18px" }}
          color={primaryColor}
          mb={2}
        >
          Start
        </Text>

        {sidebarTabs.map(({ key, label, icon: Icon }) => (
          <Flex
            key={key}
            align="center"
            mb={2}
            cursor="pointer"
            onClick={() => {
              toggleTab(key);
            }}
            color="brand.500"
            gap={1}
            _hover={{ textDecoration: "underline" }}
          >
            <Icon size="15px" />
            <Text fontSize={{ base: "14px", sm: "17px" }} color="brand.500">
              {label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );

  const renderEditor = () => noSelectionPane();
  // <Editor
  //   key={editorKey}
  //   height="100%"
  //   defaultLanguage="plaintext"
  //   value={value}
  //   onChange={onValueChange}
  //   theme={selectedTheme}
  //   options={{
  //     wordWrap: "on",
  //     fontSize: 14,
  //   }}
  // />

  return (
    <Split
      key={isSmallScreen ? "split-vertical" : "split-horizontal"}
      direction={isSmallScreen ? "vertical" : "horizontal"}
      className={isSmallScreen ? "split-vertical" : "split-horizontal"}
      sizes={[75, 25]}
      minSize={200}
      gutterSize={2}
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: isSmallScreen ? "column" : undefined,
      }}
    >
      <Box h="100%" w="100%" overflow="hidden">
        {themeReady && renderEditor()}
      </Box>
      <Box h="100%" w="100%" overflow="hidden">
        {themeReady && renderEditor()}
      </Box>
    </Split>
  );
};
