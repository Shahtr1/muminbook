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
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FolderSVG } from "@/components/svgs/FolderSVG.jsx";
import { FileSVG } from "@/components/svgs/FileSVG.jsx";
import { useState } from "react";

export const AddMenu = ({ onCreate }) => {
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
    onClose(); // ✅ CLOSE THE ENTIRE MENU
  };

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
        >
          <AddIcon color="#fff" fontSize={{ base: "8px", sm: "10px" }} />
          <Text color="#fff" fontSize={{ base: "12px", sm: "13px" }}>
            New
          </Text>
        </Flex>
      </MenuButton>

      <MenuList py={1}>
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
                    onClose(); // ✅ Close menu on ESC too
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
              w="100%"
              px={3}
              py={2}
              display="flex"
              alignItems="center"
              gap={2}
              onClick={(e) => {
                e.preventDefault();
                setShowFileInput(true);
              }}
            >
              <FileSVG dimensions="15px" activeColor="brand.500" />
              <Text fontSize={{ base: "12px", sm: "13px" }}>File</Text>
            </Box>
            <Box
              as="button"
              w="100%"
              px={3}
              py={2}
              display="flex"
              alignItems="center"
              gap={2}
              onClick={(e) => {
                e.preventDefault();
                setShowFolderInput(true);
              }}
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
