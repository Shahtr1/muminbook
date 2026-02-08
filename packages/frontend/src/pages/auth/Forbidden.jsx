import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Flex,
  Text,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const Forbidden = () => {
  const navigate = useNavigate();
  const { text } = useSemanticColors();
  const iconColor = text.primary;

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Flex width="100%" height="100dvh" justify="center" align="center">
      <Alert
        status="warning"
        w="fit-content"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        p={6}
      >
        <AlertIcon boxSize="24px" />
        <AlertTitle>
          <Text fontSize="lg" fontWeight="bold">
            Access Denied
          </Text>
        </AlertTitle>
        <AlertDescription mb={4}>
          <Text>You do not have permission to access this page.</Text>
        </AlertDescription>

        <Button
          leftIcon={<ArrowBackIcon />}
          size="sm"
          variant="outline"
          color={iconColor}
          borderColor={iconColor}
          onClick={handleGoBack}
          _hover={{
            bg: 'transparent',
            color: iconColor,
            borderColor: iconColor,
          }}
          _focus={{
            bg: 'transparent',
            color: iconColor,
            borderColor: iconColor,
          }}
          _active={{
            bg: 'transparent',
            color: iconColor,
            borderColor: iconColor,
          }}
        >
          Go to Homepage
        </Button>
      </Alert>
    </Flex>
  );
};
