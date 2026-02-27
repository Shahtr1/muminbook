import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  Text,
} from '@chakra-ui/react';

export const NoMatchingResults = ({
  title = 'No matching results',
  description,
  height = '100%',
  width = '100%',
  transparent = true,
  fontSize = 'lg',
  ...rest
}) => {
  return (
    <Flex
      width={width}
      height={height}
      justify="center"
      align="center"
      {...rest}
    >
      <Alert
        status="info"
        w="fit-content"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        p={6}
        bg={transparent ? 'transparent' : undefined}
      >
        <AlertTitle>
          <Text fontSize={fontSize}>{title}</Text>
        </AlertTitle>
        {description && (
          <AlertDescription>
            <Text>{description}</Text>
          </AlertDescription>
        )}
      </Alert>
    </Flex>
  );
};
