import { Sidebar } from '@/components/layout/sidebar/Sidebar.jsx';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { featureData } from '@/data/featureData.js';

export const Features = () => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  return (
    <Flex
      width="full"
      mx="auto"
      overflowX="hidden"
      flexDirection={isSmallScreen ? 'column' : 'row'}
    >
      <Sidebar label={'Features'} items={featureData()} />
      <Box
        width="full"
        p={!isSmallScreen ? 5 : undefined}
        overflowY="auto"
        height="full"
      >
        <Outlet />
      </Box>
    </Flex>
  );
};
