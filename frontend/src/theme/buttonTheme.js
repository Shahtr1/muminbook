import { mode } from "@chakra-ui/theme-tools";

const buttonTheme = {
  baseStyle: {
    fontWeight: "bold",
    borderRadius: "md",
  },
  variants: {
    solid: (props) => ({
      bg: mode("brand.500", "brand.400")(props),
      color: "white",
      _hover: {
        bg: mode("brand.600", "brand.300")(props),
      },
    }),
    outline: (props) => ({
      borderColor: mode("brand.500", "brand.400")(props),
      color: mode("brand.500", "brand.400")(props),
      _hover: {
        bg: mode("brand.50", "brand.900")(props),
      },
    }),
    secondary: (props) => ({
      bg: mode("secondary.400", "secondary.500")(props),
      color: "white",
      _hover: {
        bg: mode("secondary.500", "secondary.600")(props),
      },
    }),
  },
  defaultProps: {
    colorScheme: "brand",
  },
};

export default buttonTheme;
