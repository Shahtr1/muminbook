import { IconButton, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export const DarkModeToggle = ({
  position,
  inset,
  disableInteraction = false,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle Dark Mode"
      icon={
        colorMode === "light" ? (
          <MoonIcon color="icon.lightActive" />
        ) : (
          <SunIcon color="icon.darkActive" />
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
