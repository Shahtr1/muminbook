import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuList,
  Text,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useOpenSuhuf } from '@/hooks/suhuf/useOpenSuhuf.js';
import { useState } from 'react';
import { SuhufSVG } from '@/components/svgs/SuhufSVG.jsx';
import { BsPencilFill } from 'react-icons/bs';
import { useRenameSuhuf } from '@/hooks/suhuf/useRenameSuhuf.js';
import { IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const WorkspaceMenu = ({ suhuf }) => {
  const openSuhuf = useOpenSuhuf();
  const { mutate: renameSuhuf } = useRenameSuhuf();
  const { surface, icon, text } = useSemanticColors();
  const bgColor = surface.base;
  const iconColor = icon.default;
  const addButtonColor = text.contrast;
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(suhuf?.title || '');

  const handleAddSuhuf = () => {
    openSuhuf();
    setIsMenuOpen(false);
    cancelEdit();
  };

  const startEdit = () => {
    setEditedTitle(suhuf?.title || '');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditedTitle(suhuf?.title || '');
    setIsEditing(false);
  };

  const confirmEdit = (id) => {
    renameSuhuf({ id, title: editedTitle });
    setIsEditing(false);
  };

  return (
    <Menu
      isLazy
      placement="bottom"
      isOpen={isMenuOpen}
      onOpen={() => setIsMenuOpen(true)}
      onClose={() => {
        setIsMenuOpen(false);
        setIsEditing(false); // Reset editing when menu closes
      }}
    >
      <MenuButton
        as={Flex}
        align="center"
        cursor="pointer"
        height="100%"
        sx={{
          '> span': {
            height: '100%',
          },
        }}
      >
        <Flex
          border="none"
          cursor="pointer"
          align="center"
          justify="center"
          w={isSmallScreen ? '24px' : 'auto'}
          h={isSmallScreen ? '24px' : 'auto'}
          mr={1}
          p={isSmallScreen ? '0' : '1px'}
        >
          <SuhufSVG dimensions="20px" activeColor="brand.500" />
          {!isSmallScreen && (
            <Icon as={ChevronDownIcon} fontSize="12px" color="brand.500" />
          )}
        </Flex>
      </MenuButton>

      <MenuList
        p={{ base: 2 }}
        minW="200px"
        maxW="230px"
        sx={{
          button: {
            height: 'auto',
            padding: '0',
          },
        }}
        bg={bgColor}
      >
        <Flex direction="column" gap={2}>
          {!isEditing ? (
            <Flex w="100%" justify="space-between" align="center">
              <Tooltip
                label={suhuf?.title || 'Loading...'}
                placement="left"
                variant="inverted"
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {suhuf?.title || 'Loading...'}
                </Text>
              </Tooltip>

              <Tooltip
                label="Rename Suhuf"
                placement="right"
                variant="inverted"
              >
                <Box
                  as="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit();
                  }}
                >
                  <BsPencilFill size="12px" />
                </Box>
              </Tooltip>
            </Flex>
          ) : (
            <Flex align="center" justify="space-between" gap={2}>
              <Input
                size="xs"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    confirmEdit(suhuf._id);
                  }
                  if (e.key === 'Escape') {
                    cancelEdit();
                  }
                }}
                autoFocus
                bg="transparent"
              />

              <Flex>
                <Tooltip label="Confirm" placement="top" variant="inverted">
                  <Box
                    as="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmEdit(suhuf._id);
                    }}
                    color="brand.500"
                  >
                    <IoCheckmarkOutline size="21px" />
                  </Box>
                </Tooltip>

                <Tooltip label="Cancel" placement="top" variant="inverted">
                  <Box
                    as="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEdit();
                    }}
                    color="red.500"
                  >
                    <IoCloseOutline size="21px" />
                  </Box>
                </Tooltip>
              </Flex>
            </Flex>
          )}

          {/* Created At */}
          <Flex justify="space-between">
            <Text fontSize="xs" fontWeight="bold" color={iconColor}>
              Created At
            </Text>
            <Text fontSize="xs">
              {suhuf?.createdAt
                ? new Date(suhuf?.createdAt).toLocaleDateString()
                : 'Unknown'}
            </Text>
          </Flex>

          {/* Add New Suhuf */}
          <Button size={{ base: 'sm', md: 'md' }} onClick={handleAddSuhuf}>
            <Flex p={1} justify="center" align="center" w="100%" gap={3}>
              <Text fontSize="xs" color={addButtonColor}>
                Add new Suhuf
              </Text>
              <AddIcon
                color={addButtonColor}
                fontSize={{ base: '8px', sm: '9px' }}
              />
            </Flex>
          </Button>
        </Flex>
      </MenuList>
    </Menu>
  );
};
