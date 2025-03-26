import { Flex, useTheme } from "@chakra-ui/react";

export const Dashboard = () => {
  const theme = useTheme();
  return (
    <>
      <Flex
        minH={`calc(100vh - ${theme.sizes["navbar-height"]})`}
        w="100%"
        align="center"
        justify="center"
      >
        Coming Soon...
      </Flex>
    </>
  );
};
