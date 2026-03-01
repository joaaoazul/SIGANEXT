import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

// GET /api/profile — full profile with stats
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // ─── Athlete profile ───
    if (user.role === "client") {
      const clientId = await getClientId(user);
      const clientData = await prisma.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          status: true,
          height: true,
          weight: true,
          primaryGoal: true,
          trainingExperience: true,
          activityLevel: true,
          createdAt: true,
        },
      });

      if (!clientData) {
        return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
      }

      // Athlete stats
      let totalWorkouts = 0;
      let totalCheckins = 0;
      let activePlans = 0;
      try {
        [totalWorkouts, totalCheckins, activePlans] = await Promise.all([
          prisma.workoutLog.count({ where: { clientId } }),
          prisma.checkIn.count({ where: { clientId } }),
          prisma.trainingPlanAssignment.count({ where: { clientId, isActive: true } }),
        ]);
      } catch (e) {
        console.error("profile stats error:", e);
      }

      return NextResponse.json({
        ...clientData,
        coverImage: null,
        bio: null,
        specialties: null,
        location: null,
        socialLinks: null,
        role: "client",
        stats: {
          totalWorkouts,
          totalCheckins,
          activePlans,
        },
      });
    }

    // ─── PT / Admin profile ───
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        coverImage: true,
        bio: true,
        specialties: true,
        location: true,
        socialLinks: true,
        role: true,
        createdAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    // Gather stats for the profile
    const [
      totalClients,
      activeClients,
      totalPlans,
      totalNutritionPlans,
      totalExercises,
    ] = await Promise.all([
      prisma.client.count({ where: { managerId: user.id, deletedAt: null } }),
      prisma.client.count({ where: { managerId: user.id, status: "active", deletedAt: null } }),
      prisma.trainingPlan.count(),
      prisma.nutritionPlan.count(),
      prisma.exercise.count(),
    ]);

    // Parse socialLinks JSON safely
    let parsedSocialLinks = null;
    if (userData.socialLinks) {
      try {
        parsedSocialLinks = JSON.parse(userData.socialLinks);
      } catch {
        parsedSocialLinks = null;
      }
    }

    return NextResponse.json({
      ...userData,
      socialLinks: parsedSocialLinks,
      stats: {
        totalClients,
        activeClients,
        totalPlans,
        totalNutritionPlans,
        totalExercises,
      },
    });
  } catch (error) {
    console.error("profile GET error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: "Erro interno", details: message }, { status: 500 });
  }
}

// PUT /api/profile — update profile info
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();

    const socialLinksStr =
      body.socialLinks && typeof body.socialLinks === "object"
        ? JSON.stringify(body.socialLinks)
        : undefined;

    // Client update
    if (user.role === "client") {
      const clientId = await getClientId(user);
      const updated = await prisma.client.update({
        where: { id: clientId },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.email && { email: body.email }),
          ...(body.phone !== undefined && { phone: body.phone || null }),
          ...(body.avatar !== undefined && { avatar: body.avatar || null }),
        },
        select: { id: true, name: true, email: true, phone: true, avatar: true },
      });
      return NextResponse.json({ ...updated, role: "client" });
    }

    // PT/Admin update
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.bio !== undefined && { bio: body.bio || null }),
        ...(body.specialties !== undefined && { specialties: body.specialties || null }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.avatar !== undefined && { avatar: body.avatar || null }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage || null }),
        ...(socialLinksStr !== undefined && { socialLinks: socialLinksStr }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        coverImage: true,
        bio: true,
        specialties: true,
        location: true,
        socialLinks: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("profile PUT error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
