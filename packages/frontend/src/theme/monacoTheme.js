import colors from '@/theme/colors.js';

export const defineMbTheme = (monaco, colorMode = 'light') => {
  if (!monaco) return;

  const lightThemeName = 'mb-theme-light';
  const darkThemeName = 'mb-theme-dark';

  if (colorMode === 'dark') {
    monaco.editor.defineTheme(darkThemeName, {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': colors.wn.bg_content.dark,
        'editorLineNumber.foreground': colors.wn.bg_content.light,
        'editorLineNumber.activeForeground': colors.wn.bg_content.light,
      },
    });
  } else {
    monaco.editor.defineTheme(lightThemeName, {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': colors.wn.bg_content.light,
        'editorLineNumber.foreground': colors.wn.bg_content.dark,
        'editorLineNumber.activeForeground': colors.wn.bg_content.dark,
      },
    });
  }
};
