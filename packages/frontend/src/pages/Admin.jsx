import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar/Sidebar.jsx';
import { adminData } from '@/data/adminData.js';

export const Admin = () => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  return (
    <Flex
      width="full"
      mx="auto"
      overflowX="hidden"
      flexDirection={isSmallScreen ? 'column' : 'row'}
    >
      <Sidebar label={'Admin'} items={adminData()} />
      <Box width="full" p={5} overflowY="auto" height="full">
        <Outlet />
      </Box>
    </Flex>
  );
};
