/**
 * Validation utilities for form inputs
 * These validators are used for both client-side and server-side validation
 */

export const validators = {
  /**
   * Validates phone number (exactly 10 digits)
   */
  phone: (value: string): boolean => {
    return /^[0-9]{10}$/.test(value);
  },

  /**
   * Validates Aadhar number (exactly 12 digits)
   */
  aadhar: (value: string): boolean => {
    return /^[0-9]{12}$/.test(value);
  },

  /**
   * Validates email format
   */
  email: (value: string): boolean => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(value);
  },

  /**
   * Validates non-negative amount
   */
  amount: (value: number | string): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= 0;
  },

  /**
   * Validates age (positive integer, reasonable range)
   */
  age: (value: number | string): boolean => {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    return Number.isInteger(num) && num > 0 && num < 150;
  },

  /**
   * Validates non-empty string
   */
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * Validates string length
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  /**
   * Validates minimum length
   */
  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  }
};

export const errorMessages = {
  phone: 'Phone number must be exactly 10 digits',
  aadhar: 'Aadhar number must be exactly 12 digits',
  email: 'Please enter a valid email address',
  amount: 'Amount must be a non-negative number',
  age: 'Age must be between 1 and 149',
  required: 'This field is required',
  maxLength: (max: number) => `Maximum ${max} characters allowed`,
  minLength: (min: number) => `Minimum ${min} characters required`
};
