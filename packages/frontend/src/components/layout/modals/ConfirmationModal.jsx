import { Button } from '@chakra-ui/react';
import { XModal } from '@/components/layout/modals/XModal.jsx';

const ConfirmationModal = ({
  isOpen,
  onClose,
  yesLabel = 'Submit',
  noLabel = 'Cancel',
  children,
  title = 'Action',
  onSave,
  yesVariant = 'solid',
}) => {
  const handleSave = () => {
    onSave();
    onClose();
  };

  const footer = (
    <>
      <Button
        onClick={onClose}
        variant="ghost"
        mr={3}
        size={{ base: 'sm', sm: 'md' }}
      >
        {noLabel}
      </Button>
      <Button
        onClick={handleSave}
        size={{ base: 'sm', sm: 'md' }}
        variant={yesVariant}
      >
        {yesLabel}
      </Button>
    </>
  );

  return (
    <XModal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      {children}
    </XModal>
  );
};

export default ConfirmationModal;
