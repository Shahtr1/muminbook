import { IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export const DarkModeToggle = ({
  position,
  inset,
  disableInteraction = false,
  navbar = false,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle Dark Mode"
      icon={
        colorMode === "light" ? (
          <MoonIcon color={navbar && "text.primary"} />
        ) : (
          <SunIcon color={navbar && "white"} />
        )
      }
      onClick={toggleColorMode}
      variant="ghost"
      size="lg"
      position={position}
      inset={inset}
      _hover={disableInteraction ? { bg: "transparent" } : undefined}
      _active={disableInteraction ? { transform: "none" } : undefined}
    />
  );
};
