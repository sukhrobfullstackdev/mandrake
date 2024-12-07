export const uniqueArray = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const areArraysEqual = <T>(array1: T[], array2: T[]): boolean => {
  return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
};
