import {
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";

export const XSearch = ({ focused = false, onFocusChange }) => {
  const defaultColor = useColorModeValue("default.light", "default.dark");
  const searchInputRef = useRef(null);

  const [isFocused, setIsFocused] = useState(focused);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsFocused(focused);
  }, [focused]);

  useEffect(() => {
    if (isFocused) {
      searchInputRef.current?.focus();
    }
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocusChange) onFocusChange(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onFocusChange) onFocusChange(false);
  };

  return (
    <InputGroup
      display={{ base: isFocused ? "flex" : "none", md: "flex" }}
      flex={{ base: 1, md: isFocused ? 1 : "0.5" }}
      transition="all 0.3s ease-in-out"
    >
      <InputLeftElement height="100%">
        <Search2Icon color={defaultColor} />
      </InputLeftElement>
      <Input
        ref={searchInputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
        size="sm"
        onFocus={handleFocus}
        onBlur={handleBlur}
        transition="all 0.3s ease-in-out"
      />
    </InputGroup>
  );
};
