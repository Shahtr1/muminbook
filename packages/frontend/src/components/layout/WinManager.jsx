import {
  Box,
  Flex,
  Input,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RiCheckboxFill, RiCloseCircleFill } from 'react-icons/ri';
import { useWindows } from '@/hooks/useWindows.js';
import { useDeleteWindow } from '@/hooks/useDeleteWindow.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { BsPencilFill } from 'react-icons/bs';
import ConfirmationModal from '@/components/layout/modals/ConfirmationModal.jsx';
import { useRenameSuhuf } from '@/hooks/suhuf/useRenameSuhuf.js';
import { getPreviousNonWindowPath } from '@/utils/updateNavigationPath.js';

export const WinManager = ({ onEmpty, closeWindowId, minimizeWindowId }) => {
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const { mutate: renameSuhuf } = useRenameSuhuf();
  const { mutate: deleteWindow } = useDeleteWindow();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen: openModal, onClose } = useDisclosure();
  const textDisabledColor = useColorModeValue(
    'text.secondary',
    'text.disabled'
  );
  const hoverBg = useColorModeValue('brand.400', 'brand.600');
  const winModeHoverBg = useColorModeValue(
    'wn.icon.hover.light',
    'wn.icon.hover.dark'
  );
  const activeWindowColor = useColorModeValue(
    'wn.bg_content.light',
    'wn.bg_content.dark'
  );
  const inActiveWindowColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const { windows = [] } = useWindows();

  const queryClient = useQueryClient();

  const windowMode = queryClient.getQueryData(['windowMode']) || false;

  const [editModes, setEditModes] = useState({});
  const [editedTitles, setEditedTitles] = useState({});
  const [pendingCloseId, setPendingCloseId] = useState(null);

  useEffect(() => {
    onEmpty?.(windows.length === 0);
  }, [windows.length]);

  useEffect(() => {
    if (closeWindowId) {
      closeWindow(closeWindowId);
    }
  }, [closeWindowId]);

  useEffect(() => {
    if (minimizeWindowId) {
      navigate(getPreviousNonWindowPath());
    }
  }, [minimizeWindowId]);

  const startEdit = (typeId, currentTitle) => {
    setEditModes((prev) => ({ ...prev, [typeId]: true }));
    setEditedTitles((prev) => ({ ...prev, [typeId]: currentTitle }));
  };

  const cancelEdit = (typeId) => {
    setEditModes((prev) => ({ ...prev, [typeId]: false }));
    setEditedTitles((prev) => {
      const updated = { ...prev };
      delete updated[typeId];
      return updated;
    });
  };

  const confirmEdit = (typeId) => {
    const newTitle = editedTitles[typeId];
    renameSuhuf({ id: typeId, title: newTitle });
    cancelEdit(typeId);
  };

  if (!windows.length) return null;

  const closeWindow = (typeId) => {
    const windowToClose = windows.find((w) => w.typeId._id === typeId);
    if (!windowToClose) return;

    const isActive = isActiveWindow(typeId);
    const remainingWindows = windows.filter((w) => w.typeId._id !== typeId);

    if (isActive) {
      if (remainingWindows.length > 0) {
        const next = remainingWindows[0];
        navigate(`/suhuf/${next.typeId._id}`);
      } else navigate('/', { replace: true });
    }

    deleteWindow({ id: windowToClose._id, typeId, type: 'suhuf' });
  };

  const openWindow = (id) => {
    navigate(`/suhuf/${id}`);
  };

  const isActiveWindow = (id) => {
    return location.pathname === `/suhuf/${id}`;
  };

  return (
    <>
      <Flex
        px={isSmallScreen ? 3 : 1}
        h="win-manager-height"
        w="100%"
        overflowX="auto"
        gap="1px"
      >
        {windows.map((win) => {
          const { _id, typeId: type } = win;
          const isEditing = editModes[type._id];

          return (
            <Flex
              key={_id}
              bgColor={
                windowMode
                  ? isActiveWindow(type._id)
                    ? activeWindowColor
                    : inActiveWindowColor
                  : 'brand.500'
              }
              _hover={{
                bgColor: windowMode
                  ? isActiveWindow(type._id)
                    ? activeWindowColor
                    : winModeHoverBg
                  : hoverBg,
              }}
              p={1}
              cursor="pointer"
              align="center"
              borderTopRadius="md"
              border="1px solid"
              borderBottom="none"
              borderColor={windowMode ? activeWindowColor : 'brand.500'}
              flex="1 1 0"
              minW="120px"
              maxW="145px"
              justify="space-between"
              gap={2}
              onClick={() => !isEditing && openWindow(type?._id)}
            >
              {isEditing ? (
                <Flex align="center" gap={1}>
                  <Input
                    size="xs"
                    value={editedTitles[type._id]}
                    onChange={(e) =>
                      setEditedTitles((prev) => ({
                        ...prev,
                        [type._id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        confirmEdit(type._id);
                      }
                      if (e.key === 'Escape') {
                        cancelEdit(type._id);
                      }
                    }}
                    onBlur={() => {
                      cancelEdit(type._id);
                    }}
                    autoFocus
                  />

                  <Tooltip
                    label="Confirm"
                    hasArrow={!windowMode}
                    placement="top"
                    variant={windowMode ? 'inverted' : undefined}
                  >
                    <Box
                      as="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmEdit(type._id);
                      }}
                      _hover={{ color: 'green.600' }}
                      color={windowMode ? 'green.500' : 'white'}
                    >
                      <RiCheckboxFill size="13px" />
                    </Box>
                  </Tooltip>

                  <Tooltip
                    label="Cancel"
                    hasArrow={!windowMode}
                    placement="top"
                    variant={windowMode ? 'inverted' : undefined}
                  >
                    <Box
                      as="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEdit(type._id);
                      }}
                      _hover={{ color: 'red.500' }}
                      color="red.600"
                    >
                      <RiCloseCircleFill size="13px" />
                    </Box>
                  </Tooltip>
                </Flex>
              ) : (
                <>
                  <Tooltip
                    label={type.title}
                    hasArrow={!windowMode}
                    placement="top"
                    variant={windowMode ? 'inverted' : undefined}
                  >
                    <Text
                      fontSize="12px"
                      fontWeight="600"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      color={
                        windowMode
                          ? isActiveWindow(type._id)
                            ? 'brand.500'
                            : textDisabledColor
                          : undefined
                      }
                    >
                      {type.title}
                    </Text>
                  </Tooltip>

                  <Flex gap={2}>
                    <Tooltip
                      label="Rename window"
                      hasArrow={!windowMode}
                      placement="top"
                      variant={windowMode ? 'inverted' : undefined}
                    >
                      <Box
                        as="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(type._id, type.title);
                        }}
                        _hover={{
                          color: isActiveWindow(type?._id)
                            ? 'brand.600'
                            : 'gray.500',
                        }}
                        color={
                          windowMode
                            ? isActiveWindow(type?._id)
                              ? 'brand.500'
                              : textDisabledColor
                            : undefined
                        }
                      >
                        <BsPencilFill size="12px" />
                      </Box>
                    </Tooltip>
                    {!isActiveWindow(type._id) && (
                      <Tooltip
                        label="Delete window"
                        hasArrow={!windowMode}
                        placement="top"
                        variant={windowMode ? 'inverted' : undefined}
                      >
                        <Box
                          as="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingCloseId(type._id);
                            openModal();
                          }}
                          _hover={{ color: 'red.600' }}
                          color={
                            windowMode
                              ? isActiveWindow(type?._id)
                                ? undefined
                                : textDisabledColor
                              : undefined
                          }
                        >
                          <RiCloseCircleFill size="12px" />
                        </Box>
                      </Tooltip>
                    )}
                  </Flex>
                </>
              )}
            </Flex>
          );
        })}
      </Flex>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => {
          setPendingCloseId(null);
          onClose();
        }}
        title="Delete window?"
        yesLabel="Yes"
        noLabel="No"
        yesVariant="danger"
        onSave={() => {
          if (pendingCloseId) {
            closeWindow(pendingCloseId);
            setPendingCloseId(null);
            onClose();
          }
        }}
      >
        <Text>Are you sure you want to delete this window?</Text>
      </ConfirmationModal>
    </>
  );
};
