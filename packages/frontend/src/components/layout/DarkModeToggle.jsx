import { IconButton, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

export const DarkModeToggle = ({
  position,
  inset,
  disableInteraction = false,
  variant = 'auth',
  height = 'auto',
}) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle Dark Mode"
      icon={
        colorMode === 'light' ? (
          <MoonIcon color={variant === 'navbar' ? 'text.primary' : undefined} />
        ) : (
          <SunIcon color={variant === 'navbar' ? 'white' : undefined} />
        )
      }
      onClick={toggleColorMode}
      variant="ghost"
      size={variant === 'window' ? 'xs' : 'lg'}
      position={position}
      inset={inset}
      _hover={disableInteraction ? { bg: 'transparent' } : undefined}
      _active={disableInteraction ? { transform: 'none' } : undefined}
      borderRadius="none"
      w="28px"
      h={variant === 'auth' ? '40px' : height}
    />
  );
};
