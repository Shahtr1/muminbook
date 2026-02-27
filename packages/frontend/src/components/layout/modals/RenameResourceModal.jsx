import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { XModal } from '@/components/layout/modals/XModal.jsx';
import { useRenameResource } from '@/hooks/explorer/useRenameResource.js';

const RenameResourceModal = ({ isOpen, onClose, id, type, name }) => {
  const baseName =
    type === 'file' && name ? name.replace(/\.txt$/, '') : (name ?? '');

  const [newName, setNewName] = useState(baseName);

  const [errors, setErrors] = useState({});

  const { mutate: renameResource } = useRenameResource();

  const title = type === 'file' ? 'Rename File' : 'Rename Folder';

  useEffect(() => {
    if (isOpen) {
      setNewName(baseName);
      setErrors({});
    }
  }, [isOpen, baseName]);

  const removeError = (field) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSave = () => {
    if (!newName?.trim()) {
      setErrors({ name: 'Name is required.' });
      return;
    }

    renameResource({ id, name: newName });
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
        Cancel
      </Button>
      <Button
        colorScheme="blue"
        onClick={handleSave}
        size={{ base: 'sm', sm: 'md' }}
      >
        Rename
      </Button>
    </>
  );

  return (
    <XModal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <FormControl id="name" isInvalid={!!errors?.name}>
        <InputGroup size={{ base: 'sm', sm: 'md' }} flex="1">
          <Input
            autoFocus
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              removeError('name');
            }}
            placeholder="New name"
            size={{ base: 'sm', sm: 'md' }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          {type === 'file' && <InputRightAddon>.txt</InputRightAddon>}
        </InputGroup>
        <FormErrorMessage>{errors?.name}</FormErrorMessage>
      </FormControl>
    </XModal>
  );
};

export default RenameResourceModal;
