import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const limit = parseInt(searchParams.get("limit") || "200");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
      ];
    }
    if (category) where.category = category;

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        orderBy: { name: "asc" },
        take: Math.min(limit, 500),
        skip: offset,
      }),
      prisma.food.count({ where }),
    ]);

    return NextResponse.json(foods, {
      headers: { "X-Total-Count": total.toString() },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar alimentos" }, { status: 500 });
  }
}

const foodSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  category: z.string().min(1, "Categoria é obrigatória"),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0).optional().nullable(),
  sugar: z.coerce.number().min(0).optional().nullable(),
  sodium: z.coerce.number().min(0).optional().nullable(),
  isSupplement: z.boolean().optional(),
  brand: z.string().max(200).optional().nullable(),
  servingSize: z.coerce.number().min(0).optional().nullable(),
  servingUnit: z.string().max(50).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const raw = await request.json();
    const result = foodSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const data = result.data;

    const food = await prisma.food.create({
      data: {
        name: data.name,
        category: data.category,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber ?? null,
        sugar: data.sugar ?? null,
        sodium: data.sodium ?? null,
        isSupplement: data.isSupplement || false,
        brand: data.brand || null,
        servingSize: data.servingSize ?? null,
        servingUnit: data.servingUnit || null,
      },
    });

    return NextResponse.json(food, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar alimento" }, { status: 500 });
  }
}
