import { normalizeEmail } from "../models/users";
import { ValidationError } from "../services/authService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const requireString = (value: unknown, label: string): string => {
  if (typeof value !== "string") {
    throw new ValidationError(label, `${label} is required`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(label, `${label} is required`);
  }

  return trimmed;
};

export const optionalString = (
  value: unknown,
  label: string,
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError(label, `${label} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(label, `${label} is required`);
  }

  return trimmed;
};

export const validateEmail = (value: unknown): string => {
  const raw = requireString(value, "email");
  const normalized = normalizeEmail(raw);

  if (!emailRegex.test(normalized)) {
    throw new ValidationError("email", "Invalid email");
  }

  return normalized;
};

export const validatePassword = (value: unknown): string => {
  const password = requireString(value, "password");

  if (password.length < 5 || password.length > 128) {
    throw new ValidationError("password", "Password must be 5-128 characters");
  }

  return password;
};

export const validateName = (value: unknown, label: string): string => {
  const name = requireString(value, label);

  if (name.length > 80) {
    throw new ValidationError(label, `${label} is too long`);
  }

  return name;
};

export const validateToken = (value: unknown): string => {
  const token = requireString(value, "token");

  if (token.length < 16) {
    throw new ValidationError("token", "Invalid token");
  }

  return token;
};
