import { Flex, Image, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { DarkModeToggle } from '@/components/layout/DarkModeToggle.jsx';
import { NavItem } from '@/components/layout/navbar/NavItem.jsx';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH } from '@/hooks/useAuth.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Search2Icon } from '@chakra-ui/icons';
import { XDivider } from '@/components/layout/xcomp/XDivider.jsx';
import { NavMenuItem } from '@/components/layout/navbar/NavMenuItem.jsx';
import { NotificationMenu } from '@/components/layout/navbar/menus/NotificationMenu.jsx';
import { UserMenu } from '@/components/layout/navbar/menus/UserMenu.jsx';
import { FeaturesMenu } from '@/components/layout/navbar/menus/FeaturesMenu.jsx';
import { navItems } from '@/data/navbarData.js';
import { XSearch } from '@/components/layout/xcomp/XSearch.jsx';

export const Navbar = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData([AUTH]);
  const { colorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();

  const [isFocused, setIsFocused] = useState(false);

  const activeColor = useColorModeValue('active.light', 'active.dark');
  const defaultColor = useColorModeValue('default.light', 'default.dark');

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isFocused) {
      searchInputRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <Flex
      position="fixed"
      h="navbar-height"
      inset={0}
      borderBottom="1px solid"
      borderColor={colorMode === 'light' ? 'gray.300' : 'whiteAlpha.300'}
      boxShadow="sm"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      justify="center"
      zIndex={1100}
    >
      <Flex
        justify="space-between"
        width="full"
        maxW="x-max-width"
        px={{ base: 2, sm: 5 }}
      >
        <Flex align="center" height="100%" gap={2} flex={1}>
          {/*<Image*/}
          {/*  w={45}*/}
          {/*  src="/images/logos/logo-image.png"*/}
          {/*  alt="Muminbook Logo"*/}
          {/*  cursor="pointer"*/}
          {/*  display={{ base: 'block', md: 'none' }}*/}
          {/*  onClick={() => navigate('/')}*/}
          {/*/>*/}

          {/*<Image*/}
          {/*  w={150}*/}
          {/*  src="/images/logos/logo-with-image.png"*/}
          {/*  alt="Muminbook Logo"*/}
          {/*  cursor="pointer"*/}
          {/*  display={{ base: 'none', md: 'block' }}*/}
          {/*  onClick={() => navigate('/')}*/}
          {/*/>*/}
          <XSearch
            focused={isFocused}
            onFocusChange={setIsFocused}
            expand
            display={{ base: isFocused ? 'flex' : 'none', md: 'flex' }}
            variant="dropdown"
            isNavSearch
          />
        </Flex>

        <Flex
          h="100%"
          display={{ base: isFocused ? 'none' : 'flex', md: 'flex' }}
          align="center"
        >
          <Search2Icon
            w={{ base: '45px', sm: '65px' }}
            fontSize={25}
            color={defaultColor}
            cursor="pointer"
            display={{ base: 'block', md: 'none' }}
            _hover={{ color: activeColor }}
            onClick={() => setIsFocused(true)}
          />

          {navItems(user).map((item) => {
            const isActive = location.pathname.startsWith(item.link);

            switch (item?.id) {
              case 'user':
                return (
                  <NavMenuItem
                    key={item.id}
                    item={{ ...item }}
                    active={isActive}
                    MenuComponent={UserMenu}
                    showIcon={true}
                  />
                );
              case 'notifications':
                return (
                  <NavMenuItem
                    key={item.id}
                    item={{ ...item }}
                    active={isActive}
                    MenuComponent={NotificationMenu}
                  />
                );
              case 'features':
                return (
                  <NavMenuItem
                    key={item.id}
                    item={{ ...item }}
                    active={isActive}
                    MenuComponent={FeaturesMenu}
                  />
                );

              default:
                return (
                  <NavItem key={item.id} item={{ ...item, active: isActive }} />
                );
            }
          })}
          <XDivider orientation="vertical" height="100%" />
          <DarkModeToggle disableInteraction={true} variant="navbar" />
        </Flex>
      </Flex>
    </Flex>
  );
};
