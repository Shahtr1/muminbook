import { useParams } from 'react-router-dom';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { readingData } from '@/data/readingData.js';

export const ReadingView = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(['readingMode'], true);

    return () => {
      queryClient.setQueryData(['readingMode'], false);
    };
  }, []);

  const { id } = useParams();
  const item = readingData().find((entry) => entry.id === id);

  if (!item) {
    return (
      <Box p={6} textAlign="center">
        <Heading size="lg" color="red.500">
          Reading Not Found
        </Heading>
        <Text mt={2}>The requested reading does not exist.</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="start" spacing={4}>
        <Heading size="xl" color={item.cardColor}>
          {item.label}
        </Heading>
        <Text fontSize="md">{item.description.replace(/\n/g, ' ')}</Text>
      </VStack>
    </Box>
  );
};
