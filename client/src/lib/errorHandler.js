/**
 * Extract a clean, user-friendly error message from API errors
 * @param {Error|any} error - The error object from axios/fetch
 * @param {string} fallback - Fallback message if no specific error is found
 * @returns {string} - Clean error message
 */
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (typeof error === 'string') return error;

  // Check for network errors
  if (!error?.response) {
    return error?.message || 'Network error. Please check your connection.';
  }

  const data = error.response.data;

  // If we have field validation errors from backend
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (firstError.message) {
      return firstError.field ? `${firstError.field}: ${firstError.message}` : firstError.message;
    }
  }

  // Get error message from response
  let message = data?.message || data?.error || error.message;

  // Handle case where message is an object or array (prevent [object Object])
  if (typeof message === 'object' && message !== null) {
    try {
      message = JSON.stringify(message);
    } catch {
      message = fallback;
    }
  }

  if (typeof message === 'string') {
    // If it's a Prisma error or technical error, return a generic message
    if (
      message.includes('Prisma') ||
      message.includes('prisma') ||
      message.includes('invocation') ||
      message.includes('Argument')
    ) {
      return fallback;
    }
  }

  return message || fallback;
};
