import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;

    // Verify feedback belongs to trainer's client
    const existing = await prisma.feedback.findFirst({
      where: { id, client: { managerId: user.id } },
    });
    if (!existing) return NextResponse.json({ error: "Feedback não encontrado" }, { status: 404 });

    const data = await request.json();

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        status: data.status,
        response: data.response || null,
      },
    });

    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar feedback" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;

    // Verify feedback belongs to trainer's client
    const existing = await prisma.feedback.findFirst({
      where: { id, client: { managerId: user.id } },
    });
    if (!existing) return NextResponse.json({ error: "Feedback não encontrado" }, { status: 404 });

    await prisma.feedback.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar feedback" }, { status: 500 });
  }
}
