import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

/**
 * Helper: coerce empty strings to undefined so optional numbers don't fail .min()
 * Without this, "" → Number("") → 0 → fails min(50) etc.
 */
const optNum = (min: number, max: number) =>
  z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.coerce.number().min(min).max(max).optional().nullable()
  );

const optInt = (min: number, max: number) =>
  z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.coerce.number().int().min(min).max(max).optional().nullable()
  );

const optEnum = <T extends [string, ...string[]]>(values: T) =>
  z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.enum(values).optional().nullable()
  );

/**
 * Shared zod schema for client profile data.
 * Used by both POST /api/clients and POST /api/onboarding.
 */
export const clientProfileSchema = z.object({
  // Required
  name: z.string().min(1, "Nome é obrigatório").max(200),
  email: z.string().email("Email inválido"),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Palavra-passe deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`).max(100).optional(),

  // Personal
  phone: z.preprocess((v) => (v === "" ? undefined : v), z.string().max(30).optional().nullable()),
  dateOfBirth: z.preprocess((v) => (v === "" ? undefined : v), z.string().optional().nullable()),
  gender: optEnum(["male", "female", "other"]),

  // Physical
  height: optNum(50, 300),
  weight: optNum(20, 500),
  bodyFat: optNum(1, 80),

  // Medical
  medicalConditions: z.string().max(5000).optional().nullable(),
  medications: z.string().max(5000).optional().nullable(),
  allergies: z.string().max(5000).optional().nullable(),
  injuries: z.string().max(5000).optional().nullable(),
  surgeries: z.string().max(5000).optional().nullable(),
  familyHistory: z.string().max(5000).optional().nullable(),
  bloodPressure: z.string().max(50).optional().nullable(),
  heartRate: optInt(30, 250),

  // Lifestyle
  occupation: z.string().max(200).optional().nullable(),
  sleepHours: optNum(0, 24),
  stressLevel: optInt(1, 10),
  smokingStatus: z.string().max(100).optional().nullable(),
  alcoholConsumption: z.string().max(100).optional().nullable(),
  activityLevel: z.string().max(100).optional().nullable(),

  // Sports
  trainingExperience: z.string().max(200).optional().nullable(),
  trainingFrequency: optInt(0, 14),
  preferredTraining: z.string().max(500).optional().nullable(),
  sportHistory: z.string().max(5000).optional().nullable(),

  // Goals
  primaryGoal: z.string().max(500).optional().nullable(),
  secondaryGoal: z.string().max(500).optional().nullable(),
  targetWeight: optNum(20, 500),
  motivation: z.string().max(5000).optional().nullable(),

  // Nutrition
  dietaryRestrictions: z.string().max(2000).optional().nullable(),
  foodAllergies: z.string().max(2000).optional().nullable(),
  mealsPerDay: optInt(1, 10),
  waterIntake: optNum(0, 20),
  supplementsUsed: z.string().max(2000).optional().nullable(),

  // Other
  notes: z.string().max(10000).optional().nullable(),
  photos: z.any().optional().nullable(),

  // Admin fields (clients POST only)
  status: optEnum(["active", "inactive", "pending"]),
  plan: z.string().max(200).optional().nullable(),
  paymentStatus: optEnum(["pending", "paid", "overdue"]),
});

/** Schema for POST /api/onboarding — requires inviteId and password */
export const onboardingSchema = clientProfileSchema.extend({
  inviteId: z.string().min(1, "inviteId é obrigatório"),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Palavra-passe deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`).max(100),
});

/** Schema for POST /api/clients — password optional (auto-generated if missing) */
export const clientCreateSchema = clientProfileSchema;

export type ClientProfileData = z.infer<typeof clientProfileSchema>;
