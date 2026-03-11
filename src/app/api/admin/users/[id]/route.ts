import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, isAdmin } from "@/lib/auth";
import { logAuditFromRequest } from "@/lib/audit";
import { validatePassword } from "@/lib/schemas/password";
import { sendPasswordResetEmail, sendAccountSuspendedEmail, sendAccountReactivatedEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        bio: true,
        specialties: true,
        location: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        consentDate: true,
        consentIp: true,
        consentVersion: true,
        healthDataConsent: true,
        permissions: true,
        _count: { select: { managedClients: true, bookingSlots: true } },
        managedClients: {
          select: { id: true, name: true, email: true, status: true },
          take: 50,
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }
    logAuditFromRequest(request, "admin_view_user", {
      entity: "User",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
    });
    return NextResponse.json(targetUser);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};

    // Role update — prevent privilege escalation
    // Only superadmins can grant admin/superadmin roles
    if (body.role) {
      const allowedRoles = user.role === "superadmin"
        ? ["admin", "superadmin", "employee", "client", "suspended"]
        : ["employee", "client", "suspended"];
      if (allowedRoles.includes(body.role)) {
        data.role = body.role;
      }
    }

    // Basic field updates
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.phone !== undefined) data.phone = body.phone || null;
    if (body.bio !== undefined) data.bio = body.bio || null;
    if (body.specialties !== undefined) data.specialties = body.specialties || null;
    if (body.location !== undefined) data.location = body.location || null;

    // Password reset by admin
    if (body.newPassword) {
      const pwValidation = validatePassword(body.newPassword);
      if (!pwValidation.valid) {
        return NextResponse.json({ error: pwValidation.errors[0] }, { status: 400 });
      }
      data.password = await bcrypt.hash(body.newPassword, 12);
      data.tokenVersion = { increment: 1 };
    }

    // Consent management
    if (body.resetConsent) {
      data.consentDate = null;
      data.consentIp = null;
      data.consentVersion = null;
      data.healthDataConsent = false;
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true, name: true } });
    if (!target) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    // Sync password/tokenVersion changes to Client record (athletes have dual records)
    if (body.newPassword && target) {
      const hashedPw = data.password as string;
      await prisma.client.updateMany({
        where: { email: target.email },
        data: {
          password: hashedPw,
          tokenVersion: { increment: 1 },
        },
      });
    }

    // When reactivating a suspended account, restore Client status and clear permissions
    if (body.role && target.role === "suspended" && body.role !== "suspended") {
      data.permissions = null; // Clear the previousRole metadata
      await prisma.user.update({ where: { id }, data: { permissions: null } });
      // Also restore Client record if it was a client
      await prisma.client.updateMany({
        where: { email: target.email },
        data: { status: "active" },
      });
    }

    logAuditFromRequest(request, "admin_update_user", {
      entity: "User",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: {
        changes: Object.keys(data).filter(k => k !== "password" && k !== "tokenVersion"),
        passwordReset: !!body.newPassword,
        consentReset: !!body.resetConsent,
        targetEmail: target.email,
        previousRole: target.role,
      },
    });

    // Send email notifications
    try {
      if (body.newPassword && target.email) {
        await sendPasswordResetEmail({
          to: target.email,
          recipientName: target.name || "Utilizador",
          newPassword: body.newPassword,
        });
      }
      // Account reactivated (role changed from suspended to active)
      if (body.role && target.role === "suspended" && body.role !== "suspended" && target.email) {
        await sendAccountReactivatedEmail({
          to: target.email,
          recipientName: target.name || "Utilizador",
        });
      }
      // Account suspended via role change
      if (body.role === "suspended" && target.role !== "suspended" && target.email) {
        await sendAccountSuspendedEmail({
          to: target.email,
          recipientName: target.name || "Utilizador",
        });
      }
    } catch { /* email is best-effort */ }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const url = new URL(request.url);
    const permanent = url.searchParams.get("permanent") === "true";
    const purgeData = url.searchParams.get("purge") === "true";

    if (id === user.id) {
      return NextResponse.json({ error: "Não pode eliminar a própria conta" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { email: true, role: true, name: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (permanent) {
      // Permanent delete with optional data purge
      if (purgeData) {
        // Delete all related data first
        // User's foods
        await prisma.food.deleteMany({ where: { userId: id } });
        // User's exercises
        await prisma.exercise.deleteMany({ where: { userId: id } });
        // User's content
        await prisma.content.deleteMany({ where: { userId: id } });
        // User's booking slots
        await prisma.bookingSlot.deleteMany({ where: { userId: id } });
        // Notifications sent by user
        await prisma.notification.deleteMany({ where: { senderId: id } });
        // Feedbacks sent by user
        await prisma.feedback.deleteMany({ where: { senderId: id } });

        // Manage clients owned by this user
        const managedClients = await prisma.client.findMany({
          where: { managerId: id },
          select: { id: true },
        });
        if (managedClients.length > 0) {
          // Unlink clients from this manager
          await prisma.client.updateMany({
            where: { managerId: id },
            data: { managerId: null },
          });
        }
      }

      // Delete the user
      await prisma.user.delete({ where: { id } });

      logAuditFromRequest(request, "admin_delete_user_permanent", {
        entity: "User",
        entityId: id,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        details: {
          targetEmail: target.email,
          targetName: target.name,
          previousRole: target.role,
          dataPurged: purgeData,
        },
      });

      return NextResponse.json({ success: true, action: "deleted" });
    } else {
      // Suspend (soft delete) — save previous role for potential reactivation
      await prisma.user.update({
        where: { id },
        data: {
          role: "suspended",
          permissions: JSON.stringify({ previousRole: target.role }),
        },
      });

      logAuditFromRequest(request, "admin_suspend_user", {
        entity: "User",
        entityId: id,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        details: { targetEmail: target.email, previousRole: target.role },
      });

      // Send suspension email
      try {
        if (target.email) {
          await sendAccountSuspendedEmail({
            to: target.email,
            recipientName: target.name || "Utilizador",
          });
        }
      } catch { /* email is best-effort */ }

      return NextResponse.json({ success: true, action: "suspended" });
    }
  } catch (error) {
    logger.exception("Admin delete user error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
