import { useNavigate } from 'react-router-dom';
import { Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const NavItem = ({ item, activeBorderColor, children }) => {
  const { state } = useSemanticColors();
  const navigate = useNavigate();
  const activeColor = state.active;
  const defaultColor = state.default;
  const isMdScreen = useBreakpointValue({ base: true, md: false });

  const [hovering, setHovering] = useState(false);
  const IconComponent = item.icon;

  return (
    <Flex
      gap={0}
      key={item.id}
      flexDir="column"
      onClick={() => navigate(item.link)}
      justify={{ base: 'center', md: 'end' }}
      pr={{ base: 1, md: 'unset' }}
      align="center"
      h="100%"
      w={{ base: '45px', sm: '65px', md: '80px' }}
      borderBottom="2px solid"
      borderColor={
        item.active ? (activeBorderColor ?? activeColor) : 'transparent'
      }
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      cursor="pointer"
      position="relative"
    >
      <IconComponent
        active={hovering || item.active}
        dimensions={isMdScreen ? '25px' : '20px'}
      />

      {children ? (
        children
      ) : (
        <Text
          display={{ base: 'none', md: 'block' }}
          fontSize="xs"
          fontWeight="medium"
          color={item.active || hovering ? activeColor : defaultColor}
        >
          {item.label}
        </Text>
      )}
    </Flex>
  );
};
