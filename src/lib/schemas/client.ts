import { z } from "zod";

/**
 * Shared zod schema for client profile data.
 * Used by both POST /api/clients and POST /api/onboarding.
 */
export const clientProfileSchema = z.object({
  // Required
  name: z.string().min(1, "Nome é obrigatório").max(200),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres").max(100).optional(),

  // Personal
  phone: z.string().max(30).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),

  // Physical
  height: z.coerce.number().min(50).max(300).optional().nullable(),
  weight: z.coerce.number().min(20).max(500).optional().nullable(),
  bodyFat: z.coerce.number().min(1).max(80).optional().nullable(),

  // Medical
  medicalConditions: z.string().max(5000).optional().nullable(),
  medications: z.string().max(5000).optional().nullable(),
  allergies: z.string().max(5000).optional().nullable(),
  injuries: z.string().max(5000).optional().nullable(),
  surgeries: z.string().max(5000).optional().nullable(),
  familyHistory: z.string().max(5000).optional().nullable(),
  bloodPressure: z.string().max(50).optional().nullable(),
  heartRate: z.coerce.number().int().min(30).max(250).optional().nullable(),

  // Lifestyle
  occupation: z.string().max(200).optional().nullable(),
  sleepHours: z.coerce.number().min(0).max(24).optional().nullable(),
  stressLevel: z.coerce.number().int().min(1).max(10).optional().nullable(),
  smokingStatus: z.string().max(100).optional().nullable(),
  alcoholConsumption: z.string().max(100).optional().nullable(),
  activityLevel: z.string().max(100).optional().nullable(),

  // Sports
  trainingExperience: z.string().max(200).optional().nullable(),
  trainingFrequency: z.coerce.number().int().min(0).max(14).optional().nullable(),
  preferredTraining: z.string().max(500).optional().nullable(),
  sportHistory: z.string().max(5000).optional().nullable(),

  // Goals
  primaryGoal: z.string().max(500).optional().nullable(),
  secondaryGoal: z.string().max(500).optional().nullable(),
  targetWeight: z.coerce.number().min(20).max(500).optional().nullable(),
  motivation: z.string().max(5000).optional().nullable(),

  // Nutrition
  dietaryRestrictions: z.string().max(2000).optional().nullable(),
  foodAllergies: z.string().max(2000).optional().nullable(),
  mealsPerDay: z.coerce.number().int().min(1).max(10).optional().nullable(),
  waterIntake: z.coerce.number().min(0).max(20).optional().nullable(),
  supplementsUsed: z.string().max(2000).optional().nullable(),

  // Other
  notes: z.string().max(10000).optional().nullable(),
  photos: z.any().optional().nullable(),

  // Admin fields (clients POST only)
  status: z.enum(["active", "inactive", "pending"]).optional(),
  plan: z.string().max(200).optional().nullable(),
  paymentStatus: z.enum(["pending", "paid", "overdue"]).optional(),
});

/** Schema for POST /api/onboarding — requires inviteId and password */
export const onboardingSchema = clientProfileSchema.extend({
  inviteId: z.string().min(1, "inviteId é obrigatório"),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres").max(100),
});

/** Schema for POST /api/clients — password optional (auto-generated if missing) */
export const clientCreateSchema = clientProfileSchema;

export type ClientProfileData = z.infer<typeof clientProfileSchema>;
