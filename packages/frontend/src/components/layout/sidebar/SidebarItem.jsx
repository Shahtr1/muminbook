import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { forwardRef } from 'react';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const SidebarItem = forwardRef(
  (
    {
      item,
      isOpen,
      active,
      fontSize,
      fontWeight,
      isSubItem = false,
      isMenu = false,
    },
    ref
  ) => {
    const { text } = useSemanticColors();
    const location = useLocation();
    const handleActionClick = () => {
      if (item.action) item.action();
      else if (item.link) navigate(item.link);
    };
    const textColor = text.primary;
    const isSmallScreen = useBreakpointValue({ base: true, sm: false });
    const navigate = useNavigate();

    const subItems = item.items || [];

    if (!fontSize) {
      fontSize = isSmallScreen ? '12px' : isOpen ? '18px' : '11px';
    }

    if (!fontWeight) {
      fontWeight = isSmallScreen ? '500' : '600';
    }

    const getPadding = () => {
      let padding;
      if (isOpen) {
        padding = '10px 15px';
        if (isSubItem) {
          padding = '10px 30px';
        }
      } else if (isSubItem) {
      } else {
        padding = '5px';
      }

      if (!isSubItem && isSmallScreen) {
        padding = '10px';
      }
      return padding;
    };

    const parentContent = (isMenu, ref) => {
      const menuButtonStyles = {
        sx: {
          '> span': {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '10px',
            alignItems: 'center',
          },
        },
      };

      const padding = getPadding();

      return (
        <Flex
          as={isMenu ? MenuButton : Flex}
          ref={ref}
          align="center"
          justify={isOpen ? 'flex-start' : 'center'}
          gap={2}
          cursor="pointer"
          padding={padding}
          borderLeft={
            !isSubItem && !isSmallScreen
              ? active
                ? '4px solid'
                : '4px solid transparent'
              : undefined
          }
          borderBottom={
            isSmallScreen
              ? active
                ? '2px solid'
                : '2px solid transparent'
              : undefined
          }
          borderColor={active ? 'brand.500' : 'transparent'}
          onClick={() => subItems.length === 0 && handleActionClick()}
          direction={isOpen ? 'row' : 'column'}
          border={(!isOpen && !isSmallScreen) || isSubItem ? 'none' : undefined}
          {...(isMenu ? menuButtonStyles : {})}
        >
          {!isSmallScreen && item.icon && (
            <item.icon
              activeColor={active ? 'brand.500' : textColor}
              dimensions={isOpen ? '20px' : '25px'}
            />
          )}
          <Text
            color={active ? 'brand.500' : textColor}
            fontSize={fontSize}
            fontWeight={fontWeight}
            whiteSpace="nowrap"
          >
            {item.label}
          </Text>
        </Flex>
      );
    };

    const menuContent = (isMenu = false) => {
      const menuListStyles = {
        minW: '120px',
        gap: '10px',
        padding: '20px',
      };
      return (
        <Flex
          as={isMenu ? Menu : Flex}
          flexDir="column"
          placement={isSmallScreen ? 'bottom' : 'right'}
        >
          {parentContent(isMenu, ref)}
          <Flex
            flexDir="column"
            as={isMenu ? MenuList : Flex}
            {...(isMenu ? menuListStyles : {})}
          >
            {subItems &&
              subItems.map((subItem, index) => {
                const active = location.pathname === subItem.link;
                return (
                  <SidebarItem
                    key={index}
                    item={subItem}
                    isOpen={isOpen}
                    active={active}
                    fontSize="13px"
                    isSubItem={true}
                  ></SidebarItem>
                );
              })}
          </Flex>
        </Flex>
      );
    };

    return menuContent(subItems.length > 0 && (!isOpen || isSmallScreen));
  }
);
