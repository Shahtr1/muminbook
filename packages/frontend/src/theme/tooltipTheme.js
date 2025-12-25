export const tooltipTheme = {
  variants: {
    inverted: (props) => {
      const { theme } = props;

      const bgColor = theme.colors.wn.bg[props.colorMode];
      const textColor = theme.colors.wn.bold[props.colorMode];
      const borderColor = theme.colors.wn.icon[props.colorMode];

      return {
        bg: bgColor,
        color: textColor,
        border: '1px solid',
        borderColor: borderColor,
        fontSize: '12px',
      };
    },
  },
};
