/**
 * Get an error with a fallback message.
 * @param error - The error to get.
 */
export function getErrorWithFallback(error: unknown): Error {
  return error instanceof Error ? error : new Error("An error occurred");
}
