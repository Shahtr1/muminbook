import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
} from "@chakra-ui/react";

export const EditorBottomPanel = () => {
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  return (
    <Box h="100%" w="100%" bg={bgColor} color="white">
      <Tabs size="sm" variant="unstyled">
        <TabList borderBottom="1px solid" borderColor="gray.600" px={4}>
          <Tab _selected={{ color: "cyan.400" }}>Terminal</Tab>
          <Tab _selected={{ color: "cyan.400" }}>Output</Tab>
          <Tab _selected={{ color: "cyan.400" }}>Console</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box fontSize="sm">Terminal output here...</Box>
          </TabPanel>
          <TabPanel>
            <Box fontSize="sm">Build results here...</Box>
          </TabPanel>
          <TabPanel>
            <Box fontSize="sm">Console logs here...</Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
