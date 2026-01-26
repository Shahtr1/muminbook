import { StarIcon } from '@chakra-ui/icons';
import { HiDotsVertical } from 'react-icons/hi';
import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

export const ItemToolbar = ({
  zIndex,
  isFavourite = false,
  children,
  right = '5px',
}) => {
  const location = useLocation();
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const isFolderView =
    location.pathname.includes('/explorer/my-files') ||
    location.pathname.includes('/explorer/trash');

  return (
    <Flex
      position="absolute"
      top={isFolderView ? '0' : '8px'}
      right={right}
      gap={isFolderView ? 1 : 2}
      zIndex={zIndex ?? 'auto'}
      align="center"
    >
      {!isFolderView && (
        <StarIcon
          fontSize={isSmallScreen || isFolderView ? '11px' : '15px'}
          onClick={() => {
            console.log('favourite clicked');
          }}
          color={isFavourite ? 'brand.600' : 'gray.500'}
        />
      )}

      <Menu placement="bottom-start">
        <MenuButton
          as={Flex}
          align="center"
          cursor="pointer"
          height="100%"
          sx={{
            '> span': {
              height: '100%',
            },
          }}
        >
          <Box p={isSmallScreen ? '0px 2px' : 1}>
            <HiDotsVertical
              fontSize={isSmallScreen || isFolderView ? '11px' : '15px'}
            />
          </Box>
        </MenuButton>

        {children && (
          <MenuList minW="fit-content" maxW="fit-content">
            {children}
          </MenuList>
        )}
      </Menu>
    </Flex>
  );
};
