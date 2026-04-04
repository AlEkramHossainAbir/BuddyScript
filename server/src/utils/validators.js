/**
 * Email validation utility
 * Validates email format using RFC 5322 standards (simplified)
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation utility
 * Checks for minimum length and character complexity
 */
const validatePassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Get password validation error message
 */
const getPasswordValidationError = () => {
  return 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number';
};

/**
 * Sanitize user input to prevent injection attacks
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  validateEmail,
  validatePassword,
  getPasswordValidationError,
  sanitizeInput
};
