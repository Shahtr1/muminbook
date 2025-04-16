import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const XSearch = ({
  focused = false,
  onFocusChange,
  onSearch,
  expand = false,
  display = "flex",
  bgColor,
  color,
  size = "sm",
  width,
  parentWidth = "100%",
  variant = "default",
  isNavSearch = false,
  debounceDelay = 300,
}) => {
  const xColor = color || useColorModeValue("default.light", "default.dark");
  const searchInputRef = useRef(null);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const theme = useTheme();
  const queryClient = useQueryClient();
  const windowMode = queryClient.getQueryData(["windowMode"]) || false;

  const [isFocused, setIsFocused] = useState(focused);
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  const dropdownBg = useColorModeValue("white", "gray.800");
  const dropdownHover = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");

  // Sync focus prop
  useEffect(() => {
    setIsFocused(focused);
    if (focused) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [focused]);

  // Outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(event.target))
      ) {
        setIsFocused(false);
        setSearch("");
        onFocusChange?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onFocusChange]);

  useEffect(() => {
    if (!onSearch) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onSearch(search);
    }, debounceDelay);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFocused(false);
        setSearch("");
        onFocusChange?.(false);
        searchInputRef.current?.blur();
      }
    };

    const inputEl = searchInputRef.current;
    if (inputEl) {
      inputEl.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (inputEl) {
        inputEl.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [onFocusChange]);

  useEffect(() => {
    if (variant !== "dropdown" && !isNavSearch) return;
    const handleGlobalKeydown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsFocused(true);
        onFocusChange?.(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    };

    window.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, [onFocusChange]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const dropdown = () => (
    <Flex
      id="dropdown"
      ref={dropdownRef}
      direction="column"
      pos="fixed"
      top={windowMode ? "30px" : `${theme.sizes["navbar-height"]}`}
      left="50%"
      transform="translateX(-50%)"
      w="99vw"
      maxW="99vw"
      bg={dropdownBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="sm"
      boxShadow="md"
      zIndex={10}
      p={1}
      mt={1}
    >
      <Flex
        px={3}
        py={2}
        _hover={{
          bg: dropdownHover,
          cursor: "pointer",
        }}
      >
        Quran
      </Flex>
    </Flex>
  );

  return (
    <InputGroup
      ref={wrapperRef}
      display={display}
      flex={{ md: expand && isFocused ? 1 : expand ? 0.5 : "unset" }}
      transition="all 0.3s ease-in-out"
      position="relative"
      w={parentWidth}
    >
      <InputLeftElement height="100%" w={size === "xs" ? 7 : undefined}>
        <Search2Icon color={xColor} fontSize={size} />
      </InputLeftElement>
      <Input
        ref={searchInputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
        size={size}
        onFocus={handleFocus}
        transition="all 0.3s ease-in-out"
        bgColor={bgColor}
        _placeholder={{ color: color }}
        width={width}
      />
      {!isFocused && (
        <InputRightElement
          height="100%"
          pr={3}
          display={{ base: "none", sm: "flex" }}
        >
          <Text fontSize="xs" fontWeight="thin" whiteSpace="nowrap">
            Ctrl + k
          </Text>
        </InputRightElement>
      )}
      {variant === "dropdown" && isFocused && dropdown()}
    </InputGroup>
  );
};
