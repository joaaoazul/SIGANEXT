import { describe, it, expect } from "vitest";
import { cn, formatDate, formatCurrency, getInitials } from "@/lib/utils";

describe("cn (class merge)", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a Date object in pt-PT", () => {
    const result = formatDate(new Date("2024-03-15"));
    expect(result).toMatch(/15/);
    expect(result).toMatch(/03/);
    expect(result).toMatch(/2024/);
  });

  it("formats a date string", () => {
    const result = formatDate("2024-01-01");
    expect(result).toMatch(/01/);
    expect(result).toMatch(/2024/);
  });
});

describe("formatCurrency", () => {
  it("formats as EUR currency", () => {
    const result = formatCurrency(99.99);
    expect(result).toContain("99,99");
    expect(result).toMatch(/€/);
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0,00");
  });
});

describe("getInitials", () => {
  it("returns first letters of name parts", () => {
    expect(getInitials("João Silva")).toBe("JS");
  });

  it("limits to 2 characters", () => {
    expect(getInitials("Ana Maria Costa")).toBe("AM");
  });

  it("handles single name", () => {
    expect(getInitials("Admin")).toBe("A");
  });
});
