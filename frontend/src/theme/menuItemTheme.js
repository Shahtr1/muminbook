import { mode } from "@chakra-ui/theme-tools";

const menuItemTheme = {
  baseStyle: (props) => ({
    list: {
      borderRadius: "sm",
      bg: mode("white", "gray.800")(props),
      boxShadow: "sm",
    },
    item: {
      fontSize: "sm",
      color: mode("gray.600", "whiteAlpha.700")(props),
      bg: "transparent",
    },
  }),

  variants: {
    underline: () => ({
      item: {
        _hover: {
          bg: "transparent",
          textDecoration: "underline",
          borderRadius: "sm",
        },
      },
    }),
    background: (props) => ({
      item: {
        _hover: {
          bg: mode("gray.100", "gray.700")(props),
          color: mode("gray.900", "white")(props),
          borderRadius: "sm",
        },
      },
    }),
  },

  defaultProps: {
    variant: "background",
  },
};

export default menuItemTheme;
