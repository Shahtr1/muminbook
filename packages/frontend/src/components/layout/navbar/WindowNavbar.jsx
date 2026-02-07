import { Flex, Icon, Image } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoCloseOutline, IoRemoveOutline } from 'react-icons/io5';
import { DarkModeToggle } from '@/components/layout/DarkModeToggle.jsx';
import { WindowMenu } from '@/components/layout/navbar/menus/WindowMenu.jsx';
import { XSearch } from '@/components/layout/x/XSearch.jsx';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const WindowNavbar = ({ children, onClose, onMinimize }) => {
  const { surface, icon, invert } = useSemanticColors();
  const bgColor = surface.base;
  const bgContentColor = surface.content;
  const iconActiveColor = icon.active;
  const invertedIconActiveColor = invert(icon.active);
  const iconHoverGray = icon.hover;
  const { border } = useSemanticColors();
  const navigate = useNavigate();
  const location = useLocation();

  let pathArray = location.pathname.split('/');
  let typeId;
  if (pathArray && pathArray.length > 0) {
    typeId = location.pathname.split('/')[pathArray.length - 1];
  }

  return (
    <Flex
      bgColor={bgColor}
      align="center"
      justify="space-between"
      pl={2}
      zIndex={2}
      borderBottom="1px solid"
      borderColor={border.default}
    >
      <Flex gap={2} py="2px" align="center" pr={2}>
        <Image
          w={25}
          src="/images/logos/logo-image.png"
          alt="Muminbook Logo"
          cursor="pointer"
          onClick={() => navigate('/')}
        />

        <WindowMenu />
        <XSearch
          size="xs"
          width="100%"
          bgColor={bgContentColor}
          variant="dropdown"
          isNavSearch
        />
      </Flex>
      <Flex flex={1}>{children}</Flex>

      <Flex h="100%">
        <DarkModeToggle variant="window" height="100%" />
        <Flex
          _hover={{ bg: iconHoverGray }}
          cursor="pointer"
          align="center"
          justify="center"
          w="28px"
          onClick={() => onMinimize(typeId)}
        >
          <Icon as={IoRemoveOutline} boxSize={5} color={iconActiveColor} />
        </Flex>
        <Flex
          _hover={{ bg: 'red.600' }}
          cursor="pointer"
          align="center"
          justify="center"
          w="28px"
          role="group"
          onClick={() => onClose(typeId)}
        >
          <Icon
            as={IoCloseOutline}
            boxSize={5}
            color={iconActiveColor}
            _hover={{ bg: 'red.600' }}
            _groupHover={{ color: invertedIconActiveColor }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
