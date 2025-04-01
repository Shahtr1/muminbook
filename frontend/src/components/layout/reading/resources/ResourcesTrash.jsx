import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { TrashSVG } from "@/components/svgs/TrashSVG.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { HiDotsVertical } from "react-icons/hi";
import { ActionItems } from "@/components/layout/reading/ActionItems.jsx";

export const ResourcesTrash = ({ emptyTrash = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const defaultTextColor = useColorModeValue("text.primary", "whiteAlpha.900");
  const isTrashView = location.pathname.includes("/reading/trash");
  return (
    <Flex w="100%" justify="center" align="center" gap={3} pb={2}>
      <Flex
        justify="center"
        align="center"
        gap={5}
        cursor="pointer"
        role="group"
        onClick={() => navigate("trash")}
      >
        <Text
          fontSize="14px"
          _groupHover={{ color: isTrashView ? "brand.500" : "brand.600" }}
          color={isTrashView ? "brand.500" : defaultTextColor}
        >
          Trash
        </Text>
        <TrashSVG dimensions="50px" empty={emptyTrash} />
      </Flex>
      {!emptyTrash && (
        <Menu isLazy placement="right-start">
          <MenuButton
            as={Flex}
            align="center"
            cursor="pointer"
            height="100%"
            sx={{
              "> span": {
                height: "100%",
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <HiDotsVertical fontSize="15px" />
          </MenuButton>

          <MenuList minW="fit-content" maxW="fit-content">
            <ActionItems variant="trash" />
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
};
