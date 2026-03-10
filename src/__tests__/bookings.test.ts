import { describe, it, expect } from "vitest";
import { z } from "zod";

// Reproduce the booking slot schema from the API
const bookingSlotSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().min(1, "Hora início é obrigatória"),
  endTime: z.string().min(1, "Hora fim é obrigatória"),
  maxClients: z.coerce.number().int().min(1).max(50).optional().default(1),
  notes: z.string().max(1000).optional().nullable(),
  title: z.string().max(200).optional().default("PT Session"),
  isRecurring: z.boolean().optional().default(false),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

describe("bookingSlotSchema", () => {
  it("validates a simple single slot", () => {
    const result = bookingSlotSchema.safeParse({
      date: "2024-03-15",
      startTime: "09:00",
      endTime: "10:00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxClients).toBe(1);
      expect(result.data.title).toBe("PT Session");
    }
  });

  it("rejects missing startTime", () => {
    const result = bookingSlotSchema.safeParse({
      date: "2024-03-15",
      endTime: "10:00",
    });
    expect(result.success).toBe(false);
  });

  it("validates recurring slot", () => {
    const result = bookingSlotSchema.safeParse({
      startTime: "09:00",
      endTime: "10:00",
      isRecurring: true,
      daysOfWeek: [1, 3, 5],
      dateFrom: "2024-03-01",
      dateTo: "2024-03-31",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isRecurring).toBe(true);
      expect(result.data.daysOfWeek).toEqual([1, 3, 5]);
    }
  });

  it("rejects maxClients over 50", () => {
    const result = bookingSlotSchema.safeParse({
      date: "2024-03-15",
      startTime: "09:00",
      endTime: "10:00",
      maxClients: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects notes over 1000 chars", () => {
    const result = bookingSlotSchema.safeParse({
      date: "2024-03-15",
      startTime: "09:00",
      endTime: "10:00",
      notes: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid dayOfWeek values", () => {
    const result = bookingSlotSchema.safeParse({
      startTime: "09:00",
      endTime: "10:00",
      isRecurring: true,
      daysOfWeek: [7],
    });
    expect(result.success).toBe(false);
  });
});
