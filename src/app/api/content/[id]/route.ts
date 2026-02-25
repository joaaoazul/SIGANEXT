import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// PUT /api/content/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const content = await prisma.content.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.type && { type: body.type }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.url !== undefined && { url: body.url }),
      ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
    },
  });

  return NextResponse.json(content);
}

// DELETE /api/content/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.content.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
