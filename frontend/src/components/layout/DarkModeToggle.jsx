import { IconButton, MoonIcon, SunIcon, useColorMode } from "@chakra-ui/icons";

export const DarkModeToggle = ({ position, inset }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label="Toggle Dark Mode"
      icon={
        colorMode === "light" ? (
          <MoonIcon color="icon.light" />
        ) : (
          <SunIcon color="icon.dark" />
        )
      }
      onClick={toggleColorMode}
      variant="ghost"
      size="lg"
      position={position}
      inset={inset}
    />
  );
};
