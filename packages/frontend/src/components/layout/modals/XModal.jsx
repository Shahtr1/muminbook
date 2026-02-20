import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const XModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  showCloseButton = true,
}) => {
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
            borderBottom="1px solid"
          >
            {title}
          </ModalHeader>
        )}

        {showCloseButton && <ModalCloseButton />}

        <ModalBody display="flex">{children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
};
