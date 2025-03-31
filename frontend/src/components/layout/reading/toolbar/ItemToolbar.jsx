import { StarIcon } from "@chakra-ui/icons";
import { HiDotsVertical } from "react-icons/hi";
import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

export const ItemToolbar = ({ zIndex, isFavourite = false, children }) => {
  const location = useLocation();
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const isFolderOrTrashView =
    location.pathname.includes("/reading/my-files") ||
    location.pathname.includes("/reading/trash");
  return (
    <Flex
      position="absolute"
      top={isFolderOrTrashView ? "0" : "8px"}
      right="5px"
      gap={isFolderOrTrashView ? 1 : 2}
      zIndex={zIndex ?? "99"}
    >
      {!isFolderOrTrashView && (
        <StarIcon
          fontSize={isSmallScreen || isFolderOrTrashView ? "11px" : "15px"}
          onClick={() => {
            console.log("hi");
          }}
          color={isFavourite ? "brand.600" : "gray.500"}
        />
      )}

      <Menu isLazy placement="bottom-start">
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
        >
          <HiDotsVertical
            fontSize={isSmallScreen || isFolderOrTrashView ? "11px" : "15px"}
          />
        </MenuButton>

        {children && (
          <MenuList minW="fit-content" maxW="fit-content">
            {children}
          </MenuList>
        )}
      </Menu>
    </Flex>
  );
};
