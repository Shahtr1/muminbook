import {
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";

export const XSearch = ({
  focused = false,
  onFocusChange,
  expand = false,
  display = "flex",
  bgColor,
  color,
  size = "sm",
  width,
  parentWidth = "100%",
}) => {
  const xColor = color || useColorModeValue("default.light", "default.dark");
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
      display={display}
      flex={{ md: expand && isFocused ? 1 : "0.5" }}
      transition="all 0.3s ease-in-out"
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
        onBlur={handleBlur}
        transition="all 0.3s ease-in-out"
        bgColor={bgColor}
        _placeholder={{ color: color }}
        width={width}
      />
    </InputGroup>
  );
};
