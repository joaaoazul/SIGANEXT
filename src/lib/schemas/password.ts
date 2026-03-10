import { z } from "zod";
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/constants";

/**
 * Password validation schema with strength requirements.
 *
 * Rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `A palavra-passe deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(PASSWORD_MAX_LENGTH, `A palavra-passe não pode exceder ${PASSWORD_MAX_LENGTH} caracteres`)
  .refine(
    (val) => /[A-Z]/.test(val),
    "A palavra-passe deve conter pelo menos uma letra maiúscula"
  )
  .refine(
    (val) => /[a-z]/.test(val),
    "A palavra-passe deve conter pelo menos uma letra minúscula"
  )
  .refine(
    (val) => /[0-9]/.test(val),
    "A palavra-passe deve conter pelo menos um número"
  );

/**
 * Validate a password and return structured errors if invalid.
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.issues.map((i) => i.message),
  };
}
