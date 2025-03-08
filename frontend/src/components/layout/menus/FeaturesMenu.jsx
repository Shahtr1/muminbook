import {
  Box,
  Flex,
  Grid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { featureItems } from "@/data/js/featureItems.js";

export const FeaturesMenu = ({
  children,
  onOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const navigate = useNavigate();

  return (
    <Menu isLazy placement="bottom-end" onOpen={onOpen} onClose={onClose}>
      <MenuButton
        as={Flex}
        align="center"
        cursor="pointer"
        height="100%"
        sx={{
          "> span": {
            height: "100%",
          },
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </MenuButton>

      <MenuList
        p={{ base: 1, sm: 2 }}
        maxH="250px"
        overflowY="auto"
        width="fit-content"
        sx={{
          button: {
            height: "auto",
            padding: "0",
          },
        }}
      >
        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }}
          gap={{ base: 2, sm: 5 }}
        >
          {featureItems().map((item) => (
            <MenuItem
              key={item.id}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              whiteSpace="nowrap"
              h={50}
            >
              <Flex
                onClick={() => navigate(item.link)}
                borderRadius="sm"
                padding={3}
                align="center"
                gap={2}
              >
                <Box backgroundColor="brand.500" padding={1} borderRadius="sm">
                  <item.icon activeColor="white" />
                </Box>
                <Text color="brand.500" fontWeight="medium" ml={2} mx="auto">
                  {item.label}
                </Text>
              </Flex>
            </MenuItem>
          ))}
        </Grid>
      </MenuList>
    </Menu>
  );
};
