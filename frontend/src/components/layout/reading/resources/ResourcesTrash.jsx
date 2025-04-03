import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { TrashSVG } from "@/components/svgs/TrashSVG.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { HiDotsVertical } from "react-icons/hi";
import { ActionItems } from "@/components/layout/reading/ActionItems.jsx";
import ConfirmationModal from "@/components/layout/modals/ConfirmationModal.jsx";
import { useEmptyTrashResource } from "@/hooks/resource/useEmptyTrashResource.js";
import { useIsTrashEmpty } from "@/hooks/resource/useIsTrashEmpty.js";

export const ResourcesTrash = () => {
  const { emptyTrash } = useIsTrashEmpty();
  const location = useLocation();
  const navigate = useNavigate();
  const defaultTextColor = useColorModeValue("text.primary", "whiteAlpha.900");
  const { mutate: emptyTrashResource } = useEmptyTrashResource();
  const isTrashView = location.pathname.includes("/reading/trash");

  const {
    isOpen: isEmptyTrashOpen,
    onOpen: openEmptyTrashModal,
    onClose: onCloseEmptyTrash,
  } = useDisclosure();

  const handleEmptyTrash = () => {
    emptyTrashResource();
  };

  return (
    <>
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
              <ActionItems variant="trash" onEmptyTrash={openEmptyTrashModal} />
            </MenuList>
          </Menu>
        )}
      </Flex>
      <ConfirmationModal
        isOpen={isEmptyTrashOpen}
        onClose={onCloseEmptyTrash}
        title="Empty Trash"
        yesLabel="Yes"
        noLabel="No"
        onSave={handleEmptyTrash}
        yesVariant="danger"
      >
        <Text>Are you sure you want to empty trash?</Text>
      </ConfirmationModal>
    </>
  );
};
