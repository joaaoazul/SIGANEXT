import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.feedback.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar feedback" }, { status: 500 });
  }
}
