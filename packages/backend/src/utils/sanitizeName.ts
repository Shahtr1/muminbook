// utils/sanitizeName.ts

export const sanitizeName = (name: string) => {
  return name
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim(); // remove leading/trailing
};
