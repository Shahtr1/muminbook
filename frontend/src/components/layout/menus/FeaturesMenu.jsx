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
import { FamilyTreeSVG } from "@/components/svgs/FamilyTreeSVG.jsx";
import { useNavigate } from "react-router-dom";

export const FeaturesMenu = ({
  children,
  onOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const navigate = useNavigate();
  const featureItems = [
    {
      id: "family-tree",
      label: "Family Tree",
      icon: () => FamilyTreeSVG({ activeColor: "white" }),
      link: "/features/family-tree",
    },
  ];

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
        p={3}
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
        <Grid templateColumns="repeat(3, 1fr)" gap={5}>
          {featureItems.map((item) => (
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
                  <item.icon />
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
