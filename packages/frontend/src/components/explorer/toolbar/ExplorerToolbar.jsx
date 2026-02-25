import {
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react';
import { XBreadCrumb } from '@/components/explorer/XBreadCrumb.jsx';
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from '@chakra-ui/icons';
import { XSearch } from '@/components/layout/x/XSearch.jsx';
import { useEffect, useRef, useState } from 'react';
import { AddMenu } from '@/components/explorer/toolbar/AddMenu.jsx';
import { useCreateResource } from '@/hooks/explorer/useCreateResource.js';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';
import { useLocation, useSearchParams } from 'react-router-dom';

export const ExplorerToolbar = () => {
  const { overlay } = useSemanticColors();
  const bgColor = useColorModeValue('bg.light', 'bg.dark');
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const boxShadowColor = overlay.subtle;
  const theme = useTheme();
  const headerRef = useRef(null);

  const navbarHeight = parseInt(theme.space['navbar-height']);

  const [isSticky, setIsSticky] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const offset = headerRef.current.getBoundingClientRect().top;
        setIsSticky(offset <= +navbarHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
  }, [searchParams]);

  const isMyFilesView = location.pathname.includes('/reading/my-files');
  const isTrashView = location.pathname.includes('/reading/trash');

  const { mutate: createResource } = useCreateResource();

  const addNew = ({ type, name }) => {
    let path = location.pathname;

    if (path.startsWith('/reading')) {
      path = path.replace('/reading/', '');
    }

    createResource({ name, type, path });
  };

  const updateSearchQuery = (query) => {
    const nextQuery = query.trim();
    const nextParams = new URLSearchParams(searchParams);

    if (nextQuery) {
      nextParams.set('q', nextQuery);
    } else {
      nextParams.delete('q');
    }

    setSearchParams(nextParams, { replace: true });
  };

  return (
    <Flex
      ref={headerRef}
      flexDir={{ base: 'column', sm: 'row' }}
      justify="space-between"
      bg={bgColor}
      position="sticky"
      top="0"
      zIndex="1099"
      py={2}
      boxShadow={isSticky ? `0px 2px 2px -2px ${boxShadowColor}` : 'none'}
      gap={2}
      px={{ base: 2, sm: 8 }}
    >
      {/*nav div*/}
      <Flex justify="space-between" flex="1" align="center" overflowX="auto">
        <Box flex="1" overflowX="auto">
          <XBreadCrumb />
        </Box>
        <Flex w="auto">
          {isMyFilesView && (
            <Flex justify="end">
              <AddMenu data-testid="explorer-add" onCreate={addNew} />
            </Flex>
          )}
          <Icon
            ml={2}
            as={showExtras ? ChevronUpIcon : ChevronDownIcon}
            display={{ base: 'flex', sm: 'none' }}
            fontSize="18px"
            cursor="pointer"
            onClick={() => setShowExtras(!showExtras)}
            color="brand.500"
          />
        </Flex>
      </Flex>

      {/*tools div*/}
      <Flex
        justify="end"
        align="center"
        gap={3}
        display={{ base: showExtras ? 'flex' : 'none', sm: 'flex' }}
        w="auto"
      >
        {!isMyFilesView && !isTrashView && (
          <Flex
            align="center"
            gap={1}
            border="1px solid"
            borderColor="brand.500"
            borderRadius="25px"
            height="19px"
            px={2}
            cursor="pointer"
          >
            <StarIcon color="brand.500" fontSize="9px" />
            <Text color="brand.500" fontSize="11px">
              Favourites
            </Text>
          </Flex>
        )}

        <XSearch
          bgColor={bgColor}
          size="xs"
          width={120}
          parentWidth="auto"
          expand={false}
          value={searchValue}
          onChange={setSearchValue}
          onSearch={updateSearchQuery}
          onSubmit={updateSearchQuery}
          onClear={() => updateSearchQuery('')}
        />
      </Flex>
    </Flex>
  );
};
