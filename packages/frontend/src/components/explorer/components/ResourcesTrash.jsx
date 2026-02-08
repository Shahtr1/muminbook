import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { TrashSVG } from '@/components/svgs/TrashSVG.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiDotsVertical } from 'react-icons/hi';
import { ActionItems } from '@/components/explorer/ActionItems.jsx';
import ConfirmationModal from '@/components/layout/modals/ConfirmationModal.jsx';
import { useEmptyTrashResource } from '@/hooks/explorer/trash/useEmptyTrashResource.js';
import { useIsTrashEmpty } from '@/hooks/explorer/trash/useIsTrashEmpty.js';
import { useRestoreAllResource } from '@/hooks/explorer/trash/useRestoreAllResource.js';
import { useState } from 'react';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const ResourcesTrash = () => {
  const { text } = useSemanticColors();
  const { emptyTrash } = useIsTrashEmpty();
  const location = useLocation();
  const navigate = useNavigate();
  const defaultTextColor = text.primary;

  const { mutate: emptyTrashResource } = useEmptyTrashResource();
  const { mutate: restoreAllResource } = useRestoreAllResource();

  const isTrashView = location.pathname.includes('/reading/trash');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [actionType, setActionType] = useState(null);

  const openModal = (type) => {
    setActionType(type);
    onOpen();
  };

  const handleAction = () => {
    if (actionType === 'empty') {
      emptyTrashResource();
    } else if (actionType === 'restore') {
      restoreAllResource();
    }
    onClose();
  };

  const modalTitle =
    actionType === 'empty' ? 'Empty Trash' : 'Restore All Items';
  const modalText =
    actionType === 'empty'
      ? 'Are you sure you want to empty trash?'
      : 'Are you sure you want to restore all items?';

  return (
    <>
      <Flex w="100%" justify="center" align="center" gap={3} pb={1}>
        <Flex
          justify="center"
          align="center"
          gap={5}
          cursor="pointer"
          role="group"
          onClick={() => navigate('trash')}
        >
          <Text
            fontSize="14px"
            _groupHover={{ color: isTrashView ? 'brand.500' : 'brand.600' }}
            color={isTrashView ? 'brand.500' : defaultTextColor}
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
                '> span': {
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            >
              <HiDotsVertical fontSize="15px" />
            </MenuButton>

            <MenuList minW="fit-content" maxW="fit-content">
              <ActionItems
                variant="trash"
                onEmptyTrash={() => openModal('empty')}
                onRestoreAll={() => openModal('restore')}
              />
            </MenuList>
          </Menu>
        )}
      </Flex>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        yesLabel="Yes"
        noLabel="No"
        onSave={handleAction}
        yesVariant={actionType === 'empty' ? 'danger' : 'solid'}
      >
        <Text>{modalText}</Text>
      </ConfirmationModal>
    </>
  );
};
