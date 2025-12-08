import {
  Box,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { userData } from '@/data/userData.js';
import { notificationsData } from '@/data/notificationsData.js';
import { featureData } from '@/data/featureData.js';
import { AUTH } from '@/hooks/useAuth.js';
import { useQueryClient } from '@tanstack/react-query';
import { IoChevronForwardOutline, IoMenuOutline } from 'react-icons/io5';
import { navItems } from '@/data/navbarData.js';

export const WindowMenu = () => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const hoverGray = useColorModeValue(
    'wn.icon.hover.light',
    'wn.icon.hover.dark'
  );
  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const iconActiveColor = useColorModeValue('wn.bold.light', 'wn.bold.dark');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData([AUTH]);

  const handleActionClick = (item) => {
    if (item.action) item.action();
    else if (item.link) navigate(item.link);
  };

  const itemMap = {
    user: userData,
    notifications: notificationsData,
    features: featureData(),
  };

  const parentItems = navItems(user);

  const menuList = (list, label, isSubMenu = false) => {
    return (
      <Menu isLazy placement={isSubMenu ? 'right-start' : 'bottom-start'}>
        <MenuButton
          as={Flex}
          align="center"
          justifyContent="center"
          cursor="pointer"
          height="100%"
          sx={{
            '> span': {
              height: '100%',
            },
          }}
        >
          <Flex
            _hover={{ bg: 'red.600' }}
            cursor="pointer"
            align="center"
            justify={isSubMenu ? 'space-between' : 'center'}
            w={label ? 'auto' : '28px'}
            role="group"
            onClick={close}
          >
            {label ? (
              <>
                <Text variant="wn" cursor="pointer" p="3px" fontSize="12px">
                  {label}
                </Text>
                {isSubMenu && (
                  <Box pr="3px">
                    <Icon
                      as={IoChevronForwardOutline}
                      boxSize="9px"
                      color={iconActiveColor}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Icon as={IoMenuOutline} boxSize={5} color={iconActiveColor} />
            )}
          </Flex>
        </MenuButton>
        <MenuList
          sx={{
            button: {
              height: 'auto',
              padding: '0',
            },
            padding: '0',
            background: bgColor,
            border: 'none',
            minW: '120px',
          }}
        >
          {list.map((it) => {
            if (itemMap[it.id])
              return (
                <Box key={it.id}>
                  {menuList(itemMap[it.id], it.label, true)}
                </Box>
              );
            else
              return (
                <MenuItem
                  key={it.id}
                  display="flex"
                  alignItems="center"
                  whiteSpace="nowrap"
                  _hover={{ bg: hoverGray }}
                  w="100%"
                  onClick={() => handleActionClick(it)}
                >
                  <Text variant="wn" cursor="pointer" p="3px" fontSize="12px">
                    {it.label}
                  </Text>
                </MenuItem>
              );
          })}
        </MenuList>
      </Menu>
    );
  };

  const desktopNav = () => {
    {
      return parentItems.map((it) => {
        if (itemMap[it.id])
          return <Box key={it.id}>{menuList(itemMap[it.id], it.label)}</Box>;
        else
          return (
            <Text
              key={it.id}
              variant="wn"
              cursor="pointer"
              p="3px"
              fontSize="12px"
              onClick={() => handleActionClick(it)}
            >
              {it.label}
            </Text>
          );
      });
    }
  };

  return isSmallScreen ? menuList(parentItems) : desktopNav();
};
