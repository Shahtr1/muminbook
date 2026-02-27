import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { XModal } from '@/components/layout/modals/XModal.jsx';
import { useCopyResource } from '@/hooks/explorer/useCopyResource.js';
import { useMoveResource } from '@/hooks/explorer/useMoveResource.js';
import { ResourcesTree } from '@/components/explorer/components/ResourcesTree.jsx';
import { useLocation } from 'react-router-dom';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

const TransferResourceModal = ({
  isOpen,
  onClose,
  isCopy = true,
  id,
  path,
}) => {
  const { border } = useSemanticColors();
  const borderColor = border.subtle;
  const location = useLocation();
  const currentPath =
    location.pathname.replace(/^\/reading\//, '') || 'my-files';

  const [destinationPath, setDestinationPath] = useState(path || '');
  const [errors, setErrors] = useState({});

  const { mutate: copyResource } = useCopyResource();
  const { mutate: moveResource } = useMoveResource();

  useEffect(() => {
    if (isOpen) {
      setDestinationPath(path);
      setErrors({});
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!destinationPath.trim()) {
      setErrors({ destinationPath: 'Path is required.' });
      return;
    }

    const cleanedPath = destinationPath.endsWith('/')
      ? destinationPath.slice(0, -1)
      : destinationPath;

    if (isCopy)
      copyResource({ id, destinationPath: decodeURIComponent(cleanedPath) });
    else moveResource({ id, destinationPath: decodeURIComponent(cleanedPath) });

    onClose();
  };

  const removeError = (field) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
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
        data-testid={isCopy ? 'transfer-copy-submit' : 'transfer-move-submit'}
      >
        {isCopy ? 'Copy' : 'Move'}
      </Button>
    </>
  );

  return (
    <XModal
      isOpen={isOpen}
      onClose={onClose}
      title={isCopy ? 'Copy Resource' : 'Move Resource'}
      footer={footer}
    >
      <Flex flexDir="column" w="100%" gap={2}>
        <FormControl id="destinationPath" isInvalid={!!errors?.destinationPath}>
          <Input
            data-testid="transfer-destination-input"
            autoFocus
            value={destinationPath}
            onChange={(e) => {
              setDestinationPath(e.target.value);
              removeError('destinationPath');
            }}
            placeholder="Enter destination path"
            size={{ base: 'sm', sm: 'md' }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <FormErrorMessage>{errors?.destinationPath}</FormErrorMessage>
        </FormControl>
        <Text fontSize="13px">Choose destination folder:</Text>
        <Flex
          maxH="150px"
          overflow="auto"
          width="100%"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="sm"
          flexDir="column"
        >
          <ResourcesTree
            activePath={currentPath}
            onSelect={(path) => setDestinationPath(path)}
            showFiles={false}
          />
        </Flex>
      </Flex>
    </XModal>
  );
};

export default TransferResourceModal;
