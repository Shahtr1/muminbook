import { useEffect, useState } from 'react';
import { Alert, AlertIcon, Box, CloseButton } from '@chakra-ui/react';

export const XAlert = ({
  message = 'Alert message',
  duration = 10000,
  status,
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!show) return null;

  return (
    <Box position="relative" zIndex="1000">
      <Alert status={status} pr="32px" lineHeight={1}>
        <AlertIcon />
        {message}
        <CloseButton
          position="absolute"
          right="10px"
          top="8px"
          size="sm"
          onClick={() => setShow(false)}
        />
      </Alert>
    </Box>
  );
};
