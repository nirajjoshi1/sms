/**
 * Extract a clean, user-friendly error message from API errors
 * @param {Error} error - The error object from axios/fetch
 * @param {string} fallback - Fallback message if no specific error is found
 * @returns {string} - Clean error message
 */
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  // Check for network errors
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  // Get error message from response
  const message = error.response?.data?.message ||
                  error.response?.data?.error ||
                  error.message;

  // If it's a Prisma error or technical error, return a generic message
  if (message && (
    message.includes('Prisma') ||
    message.includes('prisma') ||
    message.includes('invocation') ||
    message.includes('Argument') ||
    message.includes('Invalid')
  )) {
    return fallback;
  }

  return message || fallback;
};
