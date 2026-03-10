import { describe, it, expect } from "vitest";
import { clientProfileSchema, onboardingSchema } from "@/lib/schemas/client";

describe("clientProfileSchema", () => {
  it("validates a minimal valid client", () => {
    const result = clientProfileSchema.safeParse({
      name: "João Teste",
      email: "joao@test.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = clientProfileSchema.safeParse({
      name: "",
      email: "joao@test.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = clientProfileSchema.safeParse({
      name: "João",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = clientProfileSchema.safeParse({
      name: "João Teste",
      email: "joao@test.com",
      phone: "+351912345678",
      height: 180,
      weight: 75,
      bodyFat: 15,
      gender: "male",
    });
    expect(result.success).toBe(true);
  });

  it("coerces empty strings to undefined for optional numbers", () => {
    const result = clientProfileSchema.safeParse({
      name: "João",
      email: "joao@test.com",
      height: "",
      weight: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects out-of-range height", () => {
    const result = clientProfileSchema.safeParse({
      name: "João",
      email: "joao@test.com",
      height: 400,
    });
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range weight", () => {
    const result = clientProfileSchema.safeParse({
      name: "João",
      email: "joao@test.com",
      weight: 600,
    });
    expect(result.success).toBe(false);
  });

  it("validates gender enum", () => {
    const valid = clientProfileSchema.safeParse({
      name: "Ana",
      email: "ana@test.com",
      gender: "female",
    });
    expect(valid.success).toBe(true);

    const invalid = clientProfileSchema.safeParse({
      name: "Ana",
      email: "ana@test.com",
      gender: "unknown",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates full medical/lifestyle data", () => {
    const result = clientProfileSchema.safeParse({
      name: "Carlos PT",
      email: "carlos@test.com",
      medicalConditions: "None",
      sleepHours: 8,
      stressLevel: 5,
      trainingFrequency: 4,
      mealsPerDay: 5,
      waterIntake: 2.5,
      primaryGoal: "Hipertrofia",
    });
    expect(result.success).toBe(true);
  });
});

describe("onboardingSchema", () => {
  it("requires inviteId and password", () => {
    const result = onboardingSchema.safeParse({
      name: "João",
      email: "joao@test.com",
    });
    expect(result.success).toBe(false);
  });

  it("validates with inviteId and password", () => {
    const result = onboardingSchema.safeParse({
      name: "João",
      email: "joao@test.com",
      inviteId: "abc123",
      password: "SecurePass123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = onboardingSchema.safeParse({
      name: "João",
      email: "joao@test.com",
      inviteId: "abc123",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});
