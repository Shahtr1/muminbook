const centerStyles = {
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};
export const absoluteSvgStyles = (isMdScreen) =>
  isMdScreen
    ? centerStyles
    : {
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
      };

export const absoluteBoxStyles = (isMdScreen) =>
  isMdScreen
    ? {
        ...centerStyles,
        height: '33px',
        width: '33px',
      }
    : {
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: -1,
        height: '27px',
        width: '27px',
      };
