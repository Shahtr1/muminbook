import { Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { NavItem } from '@/components/layout/navbar/NavItem.jsx';

export const NavMenuItem = ({ item, active, MenuComponent, showIcon }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [hoverMenu, setHoverMenu] = useState(false);

  const activeColor = useColorModeValue('active.light', 'active.dark');
  const defaultColor = useColorModeValue('default.light', 'default.dark');

  return (
    <MenuComponent
      key={item.id}
      onOpen={() => setOpenMenu(item.id)}
      onClose={() => setOpenMenu(null)}
      onMouseEnter={() => setHoverMenu(item.id)}
      onMouseLeave={() => setHoverMenu(null)}
    >
      <Flex position="relative" height="100%" align="center" justify="center">
        <NavItem
          item={{
            ...item,
            active: openMenu || hoverMenu === item.id || active,
          }}
          activeBorderColor={
            openMenu || (hoverMenu === item.id && !active)
              ? 'transparent'
              : (active ?? 'unset')
          }
        >
          <Flex align="end">
            <Text
              display={{ base: 'none', md: 'block' }}
              fontSize="xs"
              fontWeight="medium"
              color={
                openMenu || hoverMenu === item.id || active
                  ? activeColor
                  : defaultColor
              }
            >
              {item.label}
            </Text>
            {showIcon && (
              <ChevronDownIcon
                color={
                  openMenu || hoverMenu === item.id ? activeColor : defaultColor
                }
                display={{ base: 'none', md: 'block' }}
              />
            )}
          </Flex>
        </NavItem>
      </Flex>
    </MenuComponent>
  );
};
