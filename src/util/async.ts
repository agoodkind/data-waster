/**
 * Delays execution for a specified number of milliseconds
 * @param ms - The number of milliseconds to delay
 * @returns A promise that resolves after the specified delay
 */
export const sleep = (ms: number): Promise<void> => 
  new Promise((resolve) => setTimeout(resolve, ms));
