import {
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  useTheme,
} from '@chakra-ui/react';
import { CloseIcon, Search2Icon } from '@chakra-ui/icons';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useClickOutside } from '@/hooks/common/useClickOutside.js';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const XSearch = ({
  focused = false,
  onFocusChange,
  onSearch,
  onSubmit,
  value,
  onChange,
  onClear,
  expand = false,
  display = 'flex',
  bgColor,
  color,
  size = 'sm',
  width,
  parentWidth = '100%',
  variant = 'default',
  isNavSearch = false,
  debounceDelay = 300,
  placeholder = 'Search',
  showIcon = true,
  showClearButton = true,
  clearOnBlur = false,
  dropdownContent,
}) => {
  const { state, border } = useSemanticColors();
  const xColor = color || state.default;
  const searchInputRef = useRef(null);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const theme = useTheme();
  const queryClient = useQueryClient();

  const windowMode = queryClient.getQueryData(['windowMode']) || false;

  const [isFocused, setIsFocused] = useState(focused);
  const [internalSearch, setInternalSearch] = useState('');
  const debounceRef = useRef(null);

  const borderColor = border.light;
  const isControlled = value !== undefined;
  const searchValue = isControlled ? value : internalSearch;
  const normalizedSearchValue =
    typeof searchValue === 'string' ? searchValue : '';
  const shouldShowClearButton =
    showClearButton && normalizedSearchValue.length > 0;
  const clearButtonSize = size === 'xs' ? 'xs' : 'sm';
  const clearIconSize = size === 'xs' ? 2 : 2.5;

  const setSearchValue = (nextValue) => {
    if (!isControlled) {
      setInternalSearch(nextValue);
    }

    onChange?.(nextValue);
  };

  const clearSearch = () => {
    setSearchValue('');
    onClear?.();
  };

  // Keep internal focus state in sync with controlled `focused` prop and focus the input after render.
  useEffect(() => {
    setIsFocused(focused);
    if (focused) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [focused]);

  useClickOutside([wrapperRef, dropdownRef], () => {
    // Close when clicking outside; optionally clear the current value.
    setIsFocused(false);
    if (clearOnBlur) {
      clearSearch();
    }
    onFocusChange?.(false);
  });

  useEffect(() => {
    if (!onSearch) return;

    // Debounce search callbacks so parent consumers are not called on every keystroke.
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onSearch(normalizedSearchValue);
    }, debounceDelay);

    return () => clearTimeout(debounceRef.current);
  }, [normalizedSearchValue, onSearch, debounceDelay]);

  useEffect(() => {
    if (variant !== 'dropdown' || !isNavSearch) return;
    // Global shortcut for navbar dropdown search.
    const handleGlobalKeydown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsFocused(true);
        onFocusChange?.(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, [variant, isNavSearch, onFocusChange]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const handleInputKeyDown = (e) => {
    // Support closing the search quickly with Escape while focused in the input.
    if (e.key === 'Escape') {
      setIsFocused(false);
      clearSearch();
      onFocusChange?.(false);
      searchInputRef.current?.blur();
      return;
    }

    if (e.key === 'Enter') {
      onSubmit?.(normalizedSearchValue, e);
    }
  };

  const dropdown = () => (
    <Flex
      id="dropdown"
      ref={dropdownRef}
      direction="column"
      // Use fixed positioning for nav search so the dropdown anchors below the navbar.
      pos={isNavSearch ? 'fixed' : 'unset'}
      top={windowMode ? '30px' : `${theme.sizes['navbar-height']}`}
      left={isNavSearch ? '50%' : 'unset'}
      transform={isNavSearch ? 'translateX(-50%)' : 'unset'}
      w={isNavSearch ? '99vw' : 'auto'}
      maxW={isNavSearch ? '99vw' : 'auto'}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="sm"
      boxShadow="md"
      zIndex={10}
      mt={1}
    >
      {dropdownContent ??
        // Surface missing dropdown content only in development to avoid noisy production UI.
        (import.meta.env.VITE_NODE_ENV === 'development' && (
          <Text
            fontSize="xs"
            p={2}
            color="red.400"
            bgColor={bgColor}
            align="center"
          >
            Warning: `dropdownContent` is not provided for dropdown variant.
          </Text>
        ))}
    </Flex>
  );

  return (
    <InputGroup
      ref={wrapperRef}
      display={display}
      flex={{ md: expand && isFocused ? 1 : expand ? 0.5 : 'unset' }}
      transition="all 0.3s ease-in-out"
      position="relative"
      w={parentWidth}
      flexDir="column"
    >
      {showIcon && (
        <InputLeftElement height="100%" w={size === 'xs' ? 7 : undefined}>
          <Search2Icon color={xColor} fontSize={size} />
        </InputLeftElement>
      )}
      <Input
        ref={searchInputRef}
        value={normalizedSearchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        size={size}
        onFocus={handleFocus}
        onKeyDown={handleInputKeyDown}
        transition="all 0.3s ease-in-out"
        bgColor={bgColor}
        _placeholder={{ color: color }}
        width={width}
      />
      {shouldShowClearButton && (
        <InputRightElement
          height="100%"
          pr={1}
          pointerEvents="auto"
          w={size === 'xs' ? 7 : undefined}
        >
          <IconButton
            aria-label="Clear search"
            icon={<CloseIcon boxSize={clearIconSize} />}
            size={clearButtonSize}
            variant="ghost"
            minW={size === 'xs' ? 5 : undefined}
            h={size === 'xs' ? 5 : undefined}
            onClick={clearSearch}
          />
        </InputRightElement>
      )}
      {!shouldShowClearButton && isNavSearch && !isFocused && (
        <InputRightElement
          height="100%"
          pr={3}
          display={{ base: 'none', sm: 'flex' }}
        >
          <Text fontSize="xs" fontWeight="thin" whiteSpace="nowrap">
            Ctrl + k
          </Text>
        </InputRightElement>
      )}
      {variant === 'dropdown' && isFocused && dropdown()}
    </InputGroup>
  );
};
