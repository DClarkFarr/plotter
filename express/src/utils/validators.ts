import { normalizeEmail } from "../models/users";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const requireString = (value: unknown, label: string): string => {
  if (typeof value !== "string") {
    throw new Error(`${label} is required`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required`);
  }

  return trimmed;
};

export const validateEmail = (value: unknown): string => {
  const raw = requireString(value, "email");
  const normalized = normalizeEmail(raw);

  if (!emailRegex.test(normalized)) {
    throw new Error("Invalid email");
  }

  return normalized;
};

export const validatePassword = (value: unknown): string => {
  const password = requireString(value, "password");

  if (password.length < 12 || password.length > 128) {
    throw new Error("Password must be 12-128 characters");
  }

  return password;
};

export const validateName = (value: unknown, label: string): string => {
  const name = requireString(value, label);

  if (name.length > 80) {
    throw new Error(`${label} is too long`);
  }

  return name;
};

export const validateToken = (value: unknown): string => {
  const token = requireString(value, "token");

  if (token.length < 16) {
    throw new Error("Invalid token");
  }

  return token;
};
