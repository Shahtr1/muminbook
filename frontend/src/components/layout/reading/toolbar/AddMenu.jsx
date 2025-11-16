import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightAddon,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FolderSVG } from "@/components/svgs/FolderSVG.jsx";
import { FileSVG } from "@/components/svgs/FileSVG.jsx";
import { useEffect, useState } from "react";

export const AddMenu = ({ onCreate }) => {
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  const [showFileInput, setShowFileInput] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleReset = () => {
    setShowFileInput(false);
    setShowFolderInput(false);
    setInputValue("");
  };

  const handleCreate = () => {
    if (!inputValue.trim()) return;

    if (onCreate) {
      onCreate({
        type: showFileInput ? "file" : "folder",
        name: inputValue.trim(),
      });
    }

    handleReset();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  return (
    <Menu isLazy placement="bottom" isOpen={isOpen} onClose={onClose}>
      <MenuButton
        as={Flex}
        align="center"
        cursor="pointer"
        height="100%"
        onClick={isOpen ? onClose : onOpen}
        sx={{ "> span": { height: "100%" } }}
      >
        <Flex
          align="center"
          gap={1}
          bg="brand.500"
          borderRadius="sm"
          px={2}
          cursor="pointer"
          justify="center"
          h="23px"
          w={{ base: "auto", sm: "50px" }}
        >
          <AddIcon color="#fff" fontSize={{ base: "8px", sm: "9px" }} />
          <Text
            color="#fff"
            fontSize={{ base: "11px", sm: "12px" }}
            display={{ base: "none", sm: "initial" }}
          >
            Add
          </Text>
        </Flex>
      </MenuButton>

      <MenuList
        py={1}
        w={
          showFileInput || showFolderInput
            ? "80%"
            : { base: "130px", sm: "150px" }
        }
        minW="unset"
      >
        {showFileInput || showFolderInput ? (
          <Box px={2} py={1} display="flex" gap={1} alignItems="center">
            <InputGroup size={{ base: "xs", sm: "sm" }} flex="1">
              <Input
                placeholder={showFileInput ? "File name" : "Folder name"}
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    handleReset();
                    onClose();
                  }
                }}
              />
              {showFileInput && <InputRightAddon>.txt</InputRightAddon>}
            </InputGroup>
            <Button
              size={{ base: "xs", sm: "sm" }}
              colorScheme="brand"
              onClick={handleCreate}
              whiteSpace="nowrap"
            >
              Create
            </Button>
          </Box>
        ) : (
          <>
            <Box
              as="button"
              px={3}
              py={2}
              display="flex"
              alignItems="center"
              gap={2}
              onClick={(e) => {
                e.preventDefault();
                setShowFileInput(true);
              }}
              _hover={{ bg: hoverBg }}
              w="100%"
            >
              <FileSVG dimensions="15px" activeColor="brand.500" />
              <Text fontSize={{ base: "12px", sm: "13px" }}>File</Text>
            </Box>
            <Box
              as="button"
              px={3}
              py={2}
              display="flex"
              alignItems="center"
              gap={2}
              onClick={(e) => {
                e.preventDefault();
                setShowFolderInput(true);
              }}
              _hover={{ bg: hoverBg }}
              w="100%"
            >
              <FolderSVG dimensions="15px" />
              <Text fontSize={{ base: "12px", sm: "13px" }}>Folder</Text>
            </Box>
          </>
        )}
      </MenuList>
    </Menu>
  );
};
