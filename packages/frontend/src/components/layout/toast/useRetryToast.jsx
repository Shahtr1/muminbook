import React, { useEffect } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  CloseButton,
  HStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

// Track toast ids created by this hook so we can clean them up on navigation
const toastIds = new Set();

export const useRetryToast = () => {
  const toast = useToast();
  const color = 'gray.900';
  const location = useLocation();

  // Close and clear retry toasts when navigation occurs
  useEffect(() => {
    if (!toastIds.size) return;

    for (const id of Array.from(toastIds.values())) {
      try {
        toast.close(id);
      } catch (e) {
        // ignore errors closing toasts
      }
      toastIds.delete(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (message, onRetry, status) => {
    let toastId;

    // Map Chakra status to appropriate background color tokens
    const bgMap = {
      error: 'red.200',
      success: 'green.200',
      warning: 'yellow.200',
      info: 'blue.200',
    };

    const backgroundColor = bgMap[status] || 'gray.200';

    toastId = toast({
      position: 'bottom',
      duration: 20000,
      isClosable: true,
      status,
      render: () => (
        <Alert
          position="relative"
          status={status}
          borderRadius="md"
          p={3}
          alignItems="start"
          backgroundColor={backgroundColor}
        >
          <CloseButton
            position="absolute"
            top="8px"
            right="8px"
            onClick={() => {
              // remove the stored id when the toast is manually closed
              toastIds.delete(toastId);
              toast.close(toastId);
            }}
            color={color}
            zIndex={1}
          />

          <AlertIcon color={color} />

          <Box flex="1" color={color}>
            <Text fontWeight="bold" color={color}>
              {message}
            </Text>

            <HStack spacing={2} mt={2}>
              <Button
                size="sm"
                variant="outline"
                color={color}
                borderColor={color}
                _hover={{
                  bg: 'transparent',
                  color: color,
                  borderColor: color,
                }}
                onClick={() => {
                  try {
                    if (typeof onRetry === 'function') onRetry();
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Retry handler failed', err);
                  } finally {
                    // cleanup tracked id and close toast
                    toastIds.delete(toastId);
                    toast.close(toastId);
                  }
                }}
              >
                Retry
              </Button>
            </HStack>
          </Box>
        </Alert>
      ),
    });

    // track the toast id so we can remove it on navigation
    if (toastId) {
      toastIds.add(toastId);

      // also schedule cleanup after duration in case toast auto-closes
      setTimeout(() => toastIds.delete(toastId), 21000);
    }

    return toastId;
  };
};
