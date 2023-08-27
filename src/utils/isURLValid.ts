export function isURLValid(url: string) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
