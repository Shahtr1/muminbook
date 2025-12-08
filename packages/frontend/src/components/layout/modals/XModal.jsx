import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';

export const XModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  showCloseButton = true,
}) => {
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.500');
  const isMobile = useBreakpointValue({ base: true, sm: false });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered={true}
      motionPreset="scale"
      scrollBehavior="inside"
      trapFocus
      blockScrollOnMount
      returnFocusOnClose={false}
    >
      <ModalOverlay />

      <ModalContent
        width={isMobile ? 'calc(100% - 32px)' : undefined}
        borderRadius="sm"
        boxShadow="lg"
        overflow="hidden"
        height="auto"
      >
        {title && (
          <ModalHeader
            fontSize={{ base: '15px', sm: '17px' }}
            color="brand.500"
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            {title}
          </ModalHeader>
        )}

        {showCloseButton && <ModalCloseButton color="brand.500" />}

        <ModalBody display="flex">{children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
};
