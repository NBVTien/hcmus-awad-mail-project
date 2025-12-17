/**
 * Utility to extract error message from various error formats
 */
export function getErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle axios error format
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}
