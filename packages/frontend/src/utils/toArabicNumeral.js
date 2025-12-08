export const toArabicNumeral = (number) => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  return number
    .toString()
    .split('')
    .map((digit) => arabicDigits[parseInt(digit)])
    .join('');
};
