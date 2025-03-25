import {
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FolderSVG } from "@/components/svgs/FolderSVG.jsx";
import { FileSVG } from "@/components/svgs/FileSVG.jsx";

export const AddMenu = () => {
  return (
    <Menu isLazy placement="bottom">
      <MenuButton
        as={Flex}
        align="center"
        cursor="pointer"
        height="100%"
        sx={{
          "> span": {
            height: "100%",
          },
        }}
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

      <MenuList minW="100px" maxW="100px" py={1}>
        <MenuItem>
          <Flex align="center" gap={1}>
            <FileSVG dimensions="15px" activeColor="brand.500" />
            <Text fontSize={{ base: "12px", sm: "13px" }}>File</Text>
          </Flex>
        </MenuItem>
        <MenuItem>
          <Flex align="center" gap={1}>
            <FolderSVG dimensions="15px" />
            <Text fontSize={{ base: "12px", sm: "13px" }}>Folder</Text>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
