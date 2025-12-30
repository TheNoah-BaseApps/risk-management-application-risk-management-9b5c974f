export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  return { valid: true };
}

export function validateRiskDescription(description) {
  if (!description) {
    return { valid: false, error: 'Risk description is required' };
  }

  if (description.length < 20) {
    return { valid: false, error: 'Risk description must be at least 20 characters' };
  }

  if (description.length > 1000) {
    return { valid: false, error: 'Risk description must not exceed 1000 characters' };
  }

  return { valid: true };
}

export function validateDeadlineDate(deadlineDate) {
  const deadline = new Date(deadlineDate);
  const now = new Date();

  if (deadline <= now) {
    return { valid: false, error: 'Deadline must be in the future' };
  }

  return { valid: true };
}