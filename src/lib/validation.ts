// Iranian National ID Validation
export const validateIranianNationalId = (nationalId: string): { valid: boolean; error?: string } => {
  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(nationalId)) {
    return { valid: false, error: 'nationalIdFormat' };
  }

  // Check for all same digits (e.g., 0000000000, 1111111111)
  if (/^(\d)\1{9}$/.test(nationalId)) {
    return { valid: false, error: 'nationalIdInvalid' };
  }

  // Validate using Iranian National ID algorithm
  const digits = nationalId.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = digits[9];
  
  const isValid = (remainder < 2 && checkDigit === remainder) || 
                  (remainder >= 2 && checkDigit === 11 - remainder);
  
  if (!isValid) {
    return { valid: false, error: 'nationalIdInvalid' };
  }

  return { valid: true };
};

// Birth Date Validation
export const validateBirthDate = (birthDate: string): { valid: boolean; error?: string } => {
  if (!birthDate) {
    return { valid: false, error: 'birthDateRequired' };
  }

  const date = new Date(birthDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'birthDateInvalid' };
  }

  // Check if date is not in the future
  if (date > today) {
    return { valid: false, error: 'birthDateFuture' };
  }

  // Check for reasonable age (not older than 150 years)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 150);
  
  if (date < minDate) {
    return { valid: false, error: 'birthDateTooOld' };
  }

  return { valid: true };
};
