export function parseInput(jsonContent: string) {
  try {
    return JSON.parse(jsonContent);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error}`);
  }
}
