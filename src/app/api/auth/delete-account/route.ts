import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password obrigatória para confirmar eliminação." },
        { status: 400 }
      );
    }

    // Handle both PT (admin) and athlete (client) roles
    if (user.role === "client") {
      const clientId = await getClientId(user);
      const client = await prisma.client.findFirst({
        where: { id: clientId, deletedAt: null },
        select: { id: true, email: true, password: true },
      });

      if (!client || !client.password) {
        return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
      }

      const valid = await bcrypt.compare(password, client.password);
      if (!valid) {
        return NextResponse.json({ error: "Password incorreta" }, { status: 403 });
      }

      await prisma.$transaction(async (tx) => {
        // Soft delete client
        await tx.client.update({
          where: { id: clientId },
          data: { deletedAt: new Date(), status: "inactive" },
        });
        // Deactivate User login
        await tx.user.updateMany({
          where: { email: client.email, role: "client" },
          data: { role: "deleted_client" },
        });
      });
    } else {
      // PT / admin
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, password: true },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
      }

      const valid = await bcrypt.compare(password, dbUser.password);
      if (!valid) {
        return NextResponse.json({ error: "Password incorreta" }, { status: 403 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { role: "deleted_admin" },
      });
    }

    // Clear auth cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Erro ao eliminar conta" },
      { status: 500 }
    );
  }
}
