import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (order matters for FK constraints)
  await prisma.setLog.deleteMany();
  await prisma.exerciseLog.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.bookingSlot.deleteMany();
  await prisma.mealFood.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.nutritionPlanAssignment.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.trainingExercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.trainingPlanAssignment.deleteMany();
  await prisma.trainingPlan.deleteMany();
  await prisma.bodyAssessment.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.content.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.food.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "João Silva",
      email: "admin@siga180.pt",
      password: hashedPassword,
      role: "admin",
      phone: "+351 912 345 678",
    },
  });
  console.log("✅ Admin criado: admin@siga180.pt / admin123");

  // Create employee
  const empPassword = await bcrypt.hash("emp123", 10);
  await prisma.user.create({
    data: {
      name: "Ana Costa",
      email: "ana@siga180.pt",
      password: empPassword,
      role: "employee",
      phone: "+351 913 456 789",
      permissions: JSON.stringify(["clients", "exercises", "training", "bookings"]),
    },
  });
  console.log("✅ Funcionária criada: ana@siga180.pt / emp123");

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "Miguel Santos", email: "miguel@example.com", phone: "+351 914 111 111",
        gender: "male", dateOfBirth: new Date("1990-05-15"), status: "active",
        height: 178, weight: 82, bodyFat: 18, notes: "Objetivo: Perda de gordura",
        paymentStatus: "paid", planEndDate: new Date("2025-08-25"),
        managerId: admin.id,
        // Anamnese completa
        occupation: "Engenheiro informático", sleepHours: 7, stressLevel: 3,
        smokingStatus: "never", alcoholConsumption: "occasional", activityLevel: "moderate",
        trainingExperience: "intermediate", trainingFrequency: 4, preferredTraining: "Musculação",
        primaryGoal: "weight_loss", targetWeight: 78, motivation: "Melhorar composição corporal",
        dietaryRestrictions: "Nenhuma", mealsPerDay: 5, waterIntake: 2.5,
        medicalConditions: "Nenhuma", allergies: "Nenhuma",
        consentDate: new Date("2025-01-01"), consentVersion: "1.0", healthDataConsent: true,
      },
    }),
    prisma.client.create({
      data: {
        name: "Sofia Rodrigues", email: "sofia@example.com", phone: "+351 914 222 222",
        gender: "female", dateOfBirth: new Date("1995-08-22"), status: "active",
        height: 165, weight: 58, bodyFat: 22, notes: "Objetivo: Ganho muscular",
        paymentStatus: "paid", planEndDate: new Date("2025-09-20"),
        managerId: admin.id,
        occupation: "Fisioterapeuta", sleepHours: 8, stressLevel: 2,
        smokingStatus: "never", alcoholConsumption: "none", activityLevel: "active",
        trainingExperience: "intermediate", trainingFrequency: 5, preferredTraining: "Musculação e yoga",
        primaryGoal: "muscle_gain", secondaryGoal: "performance", motivation: "Competir em powerlifting",
        dietaryRestrictions: "Nenhuma", mealsPerDay: 4, waterIntake: 2.0,
        consentDate: new Date("2025-01-05"), consentVersion: "1.0", healthDataConsent: true,
      },
    }),
    prisma.client.create({
      data: {
        name: "Ricardo Almeida", email: "ricardo@example.com", phone: "+351 914 333 333",
        gender: "male", dateOfBirth: new Date("1988-01-10"), status: "active",
        height: 185, weight: 95, bodyFat: 25, notes: "Objetivo: Hipertrofia",
        paymentStatus: "overdue", planEndDate: new Date("2025-02-15"),
        managerId: admin.id,
        occupation: "Bancário", sleepHours: 6, stressLevel: 4,
        smokingStatus: "former", alcoholConsumption: "moderate", activityLevel: "light",
        trainingExperience: "beginner", trainingFrequency: 3,
        primaryGoal: "weight_loss", targetWeight: 85, motivation: "Saúde e bem-estar",
        medicalConditions: "Hipertensão leve", medications: "Losartan 50mg",
        bloodPressure: "135/85", heartRate: 78,
        consentDate: new Date("2025-01-10"), consentVersion: "1.0", healthDataConsent: true,
      },
    }),
    prisma.client.create({
      data: {
        name: "Beatriz Ferreira", email: "beatriz@example.com", phone: "+351 914 444 444",
        gender: "female", dateOfBirth: new Date("1992-11-30"), status: "active",
        height: 160, weight: 55, bodyFat: 20, notes: "Objetivo: Manutenção e saúde",
        paymentStatus: "paid", planEndDate: new Date("2025-09-30"),
        managerId: admin.id,
        occupation: "Professora", sleepHours: 7.5, stressLevel: 2,
        smokingStatus: "never", alcoholConsumption: "none", activityLevel: "active",
        trainingExperience: "advanced", trainingFrequency: 5, preferredTraining: "CrossFit e Musculação",
        primaryGoal: "maintenance", motivation: "Manter forma física e saúde mental",
        consentDate: new Date("2025-01-15"), consentVersion: "1.0", healthDataConsent: true,
      },
    }),
    prisma.client.create({
      data: {
        name: "Tiago Oliveira", email: "tiago@example.com", phone: "+351 914 555 555",
        gender: "male", dateOfBirth: new Date("2000-03-08"), status: "inactive",
        height: 175, weight: 70, bodyFat: 15, notes: "Objetivo: Performance desportiva",
        paymentStatus: "pending", managerId: admin.id,
      },
    }),
  ]);
  console.log(`✅ ${clients.length} clientes criados`);

  // Create exercises
  const exercises = await Promise.all([
    prisma.exercise.create({ data: { name: "Supino Plano com Barra", muscleGroup: "Peito", difficulty: "intermediate", equipment: "Barra e banco", description: "Deitar no banco plano, descer a barra ao peito e empurrar.", userId: admin.id } }),
    prisma.exercise.create({ data: { name: "Agachamento com Barra", muscleGroup: "Pernas", difficulty: "intermediate", equipment: "Barra e rack", description: "Barra nas costas, agachar até 90º.", userId: admin.id } }),
    prisma.exercise.create({ data: { name: "Peso Morto", muscleGroup: "Costas", difficulty: "advanced", equipment: "Barra", description: "Levantar a barra do chão mantendo as costas retas.", userId: admin.id } }),
    prisma.exercise.create({ data: { name: "Press Militar", muscleGroup: "Ombros", difficulty: "intermediate", equipment: "Barra ou halteres", description: "Empurrar o peso acima da cabeça.", userId: admin.id } }),
    prisma.exercise.create({ data: { name: "Curl com Barra", muscleGroup: "Bíceps", difficulty: "beginner", equipment: "Barra EZ", description: "Fletir os braços com a barra.", userId: admin.id } }),
    prisma.exercise.create({ data: { name: "Extensão de Tríceps", muscleGroup: "Tríceps", difficulty: "beginner", equipment: "Cabo ou haltere", description: "Extensão acima da cabeça.", userId: admin.id } }),
    prisma.exercise.create({ data: { name: "Prancha Abdominal", muscleGroup: "Core", difficulty: "beginner", equipment: "Nenhum", description: "Manter posição de prancha 30-60s.", userId: admin.id } }),
    prisma.exercise.create({ data: { name: "Remada com Barra", muscleGroup: "Costas", difficulty: "intermediate", equipment: "Barra", description: "Puxar a barra ao abdómen, inclinado.", userId: admin.id } }),
    prisma.exercise.create({ data: { name: "Leg Press", muscleGroup: "Pernas", difficulty: "beginner", equipment: "Máquina Leg Press", description: "Empurrar a plataforma com os pés.", userId: admin.id } }),
    prisma.exercise.create({ data: { name: "Elevações (Pull-ups)", muscleGroup: "Costas", difficulty: "advanced", equipment: "Barra fixa", description: "Puxar o corpo até ao queixo acima da barra.", userId: admin.id } }),
  ]);
  console.log(`✅ ${exercises.length} exercícios criados`);

  // Create foods
  const foods = await Promise.all([
    prisma.food.create({ data: { name: "Peito de Frango", category: "Proteínas", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, userId: admin.id } }),
    prisma.food.create({ data: { name: "Arroz Branco", category: "Cereais", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, userId: admin.id } }),
    prisma.food.create({ data: { name: "Batata Doce", category: "Tubérculos", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, userId: admin.id } }),
    prisma.food.create({ data: { name: "Salmão", category: "Proteínas", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, userId: admin.id } }),
    prisma.food.create({ data: { name: "Brócolos", category: "Vegetais", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, userId: admin.id } }),
    prisma.food.create({ data: { name: "Ovos", category: "Proteínas", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, userId: admin.id } }),
    prisma.food.create({ data: { name: "Aveia", category: "Cereais", calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, userId: admin.id } }),
    prisma.food.create({ data: { name: "Banana", category: "Frutas", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, userId: admin.id } }),
    prisma.food.create({ data: { name: "Azeite", category: "Gorduras", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, userId: admin.id } }),
    prisma.food.create({ data: { name: "Whey Protein", category: "Suplementos", calories: 120, protein: 24, carbs: 3, fat: 1, fiber: 0, isSupplement: true, userId: admin.id } }),
  ]);
  console.log(`✅ ${foods.length} alimentos criados`);

  // Create training plan
  const plan = await prisma.trainingPlan.create({
    data: {
      name: "Plano Full Body - Iniciante",
      description: "Plano de treino completo para iniciantes, 3x por semana.",
      difficulty: "beginner",
      duration: 8,
      userId: admin.id,
    },
  });
  const workout = await prisma.workout.create({
    data: {
      name: "Treino A - Full Body",
      dayOfWeek: 1,
      order: 1,
      trainingPlanId: plan.id,
    },
  });
  await Promise.all([
    prisma.trainingExercise.create({ data: { workoutId: workout.id, exerciseId: exercises[1].id, sets: 4, reps: "8-10", restSeconds: 90, order: 1, notes: "Aquecer com barra vazia" } }),
    prisma.trainingExercise.create({ data: { workoutId: workout.id, exerciseId: exercises[0].id, sets: 3, reps: "10-12", restSeconds: 60, order: 2 } }),
    prisma.trainingExercise.create({ data: { workoutId: workout.id, exerciseId: exercises[7].id, sets: 3, reps: "10-12", restSeconds: 60, order: 3 } }),
    prisma.trainingExercise.create({ data: { workoutId: workout.id, exerciseId: exercises[3].id, sets: 3, reps: "10-12", restSeconds: 60, order: 4 } }),
    prisma.trainingExercise.create({ data: { workoutId: workout.id, exerciseId: exercises[6].id, sets: 3, reps: "30-45s", restSeconds: 30, order: 5 } }),
  ]);
  // Assign to client
  await prisma.trainingPlanAssignment.create({
    data: { trainingPlanId: plan.id, clientId: clients[0].id },
  });
  console.log("✅ Plano de treino criado e atribuído");

  // Create nutrition plan
  const nutritionPlan = await prisma.nutritionPlan.create({
    data: {
      name: "Plano Cutting - 2000 kcal",
      description: "Plano alimentar para fase de definição.",
      totalCalories: 2000,
      totalProtein: 160,
      totalCarbs: 200,
      totalFat: 55,
      userId: admin.id,
    },
  });
  const meal1 = await prisma.meal.create({
    data: { name: "Pequeno-almoço", time: "07:30", order: 1, nutritionPlanId: nutritionPlan.id },
  });
  await Promise.all([
    prisma.mealFood.create({ data: { mealId: meal1.id, foodId: foods[6].id, quantity: 80 } }),
    prisma.mealFood.create({ data: { mealId: meal1.id, foodId: foods[7].id, quantity: 120 } }),
    prisma.mealFood.create({ data: { mealId: meal1.id, foodId: foods[9].id, quantity: 30 } }),
  ]);
  const meal2 = await prisma.meal.create({
    data: { name: "Almoço", time: "13:00", order: 2, nutritionPlanId: nutritionPlan.id },
  });
  await Promise.all([
    prisma.mealFood.create({ data: { mealId: meal2.id, foodId: foods[0].id, quantity: 200 } }),
    prisma.mealFood.create({ data: { mealId: meal2.id, foodId: foods[1].id, quantity: 150 } }),
    prisma.mealFood.create({ data: { mealId: meal2.id, foodId: foods[4].id, quantity: 100 } }),
  ]);
  await prisma.nutritionPlanAssignment.create({
    data: { nutritionPlanId: nutritionPlan.id, clientId: clients[0].id },
  });
  console.log("✅ Plano de nutrição criado e atribuído");

  // Body assessments
  await Promise.all([
    prisma.bodyAssessment.create({
      data: { clientId: clients[0].id, weight: 85, bodyFat: 20, muscleMass: 38, date: new Date("2025-01-15"), notes: "Primeira avaliação" },
    }),
    prisma.bodyAssessment.create({
      data: { clientId: clients[0].id, weight: 83, bodyFat: 19, muscleMass: 38.5, date: new Date("2025-02-15"), notes: "Progresso positivo" },
    }),
    prisma.bodyAssessment.create({
      data: { clientId: clients[0].id, weight: 82, bodyFat: 18, muscleMass: 39, date: new Date("2025-02-25"), notes: "A continuar a melhorar" },
    }),
  ]);
  console.log("✅ Avaliações corporais criadas");

  // Feedbacks
  await Promise.all([
    prisma.feedback.create({
      data: {
        clientId: clients[0].id, senderId: admin.id,
        type: "training", subject: "Treino muito intenso",
        message: "Os pesos do agachamento estão pesados. Posso ajustar?",
        rating: 4, status: "pending",
      },
    }),
    prisma.feedback.create({
      data: {
        clientId: clients[1].id, senderId: admin.id,
        type: "nutrition", subject: "Plano alimentar",
        message: "Gostaria de alternativas vegetarianas.",
        rating: 3, status: "reviewed", response: "Vou preparar uma versão vegetariana esta semana.",
      },
    }),
  ]);
  console.log("✅ Feedbacks criados");

  // Booking slots
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const slot1 = await prisma.bookingSlot.create({
    data: { userId: admin.id, title: "PT Individual", date: tomorrow, startTime: "09:00", endTime: "10:00", maxClients: 1 },
  });
  const slot2 = await prisma.bookingSlot.create({
    data: { userId: admin.id, title: "Aula de Grupo", type: "group", date: tomorrow, startTime: "10:00", endTime: "11:00", maxClients: 3, notes: "Aula de grupo" },
  });
  await prisma.bookingSlot.create({
    data: { userId: admin.id, title: "PT Individual", date: tomorrow, startTime: "14:00", endTime: "15:00", maxClients: 1 },
  });

  await prisma.booking.create({
    data: { bookingSlotId: slot1.id, clientId: clients[0].id, date: tomorrow, status: "confirmed" },
  });
  await prisma.booking.create({
    data: { bookingSlotId: slot2.id, clientId: clients[1].id, date: tomorrow, status: "pending" },
  });
  console.log("✅ Slots e marcações criados");

  // Notifications
  await Promise.all([
    prisma.notification.create({
      data: { senderId: admin.id, title: "Pagamento em atraso", message: "Ricardo Almeida tem o pagamento em atraso desde 15/02/2025.", type: "warning" },
    }),
    prisma.notification.create({
      data: { senderId: admin.id, title: "Novo feedback", message: "Miguel Santos enviou um feedback sobre o treino.", type: "info" },
    }),
    prisma.notification.create({
      data: { senderId: admin.id, title: "Plano de treino concluído", message: "Miguel Santos concluiu 8 semanas do plano Full Body.", type: "success" },
    }),
  ]);
  console.log("✅ Notificações criadas");

  // Content
  await Promise.all([
    prisma.content.create({
      data: { title: "Guia de Agachamento Perfeito", description: "Aprende a técnica correta do agachamento passo a passo.", type: "video", category: "Treino", url: "https://youtube.com/example", isPublished: true, userId: admin.id },
    }),
    prisma.content.create({
      data: { title: "eBook: Nutrição para Atletas", description: "Manual completo sobre macronutrientes e timing nutricional.", type: "ebook", category: "Nutrição", isPublished: true, userId: admin.id },
    }),
    prisma.content.create({
      data: { title: "10 Dicas para Melhor Recuperação", description: "Sono, hidratação, suplementação e mais.", type: "article", category: "Recuperação", isPublished: true, userId: admin.id },
    }),
  ]);
  console.log("✅ Conteúdos criados");

  // ==================== CHECK-INS ====================
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(8, 0, 0, 0);
    return d;
  };

  await Promise.all([
    // Miguel — últimos 7 dias
    prisma.checkIn.create({ data: { clientId: clients[0].id, date: daysAgo(6), mood: 4, energy: 4, sleep: 4, soreness: 2, stress: 2, trainedToday: true, followedDiet: true, waterLiters: 2.5, weight: 82.5 } }),
    prisma.checkIn.create({ data: { clientId: clients[0].id, date: daysAgo(5), mood: 3, energy: 3, sleep: 3, soreness: 3, stress: 3, trainedToday: true, followedDiet: true, waterLiters: 2.0, weight: 82.3 } }),
    prisma.checkIn.create({ data: { clientId: clients[0].id, date: daysAgo(4), mood: 5, energy: 5, sleep: 5, soreness: 1, stress: 1, trainedToday: false, followedDiet: true, waterLiters: 3.0, weight: 82.1 } }),
    prisma.checkIn.create({ data: { clientId: clients[0].id, date: daysAgo(3), mood: 4, energy: 4, sleep: 4, soreness: 2, stress: 2, trainedToday: true, followedDiet: false, waterLiters: 2.2, weight: 82.0 } }),
    prisma.checkIn.create({ data: { clientId: clients[0].id, date: daysAgo(2), mood: 4, energy: 3, sleep: 3, soreness: 3, stress: 2, trainedToday: true, followedDiet: true, waterLiters: 2.8, weight: 81.8 } }),
    prisma.checkIn.create({ data: { clientId: clients[0].id, date: daysAgo(1), mood: 5, energy: 5, sleep: 4, soreness: 2, stress: 1, trainedToday: true, followedDiet: true, waterLiters: 3.0, weight: 81.6, notes: "Sinto-me muito bem!" } }),
    // Sofia — últimos 4 dias
    prisma.checkIn.create({ data: { clientId: clients[1].id, date: daysAgo(3), mood: 4, energy: 4, sleep: 5, soreness: 1, stress: 2, trainedToday: true, followedDiet: true, waterLiters: 2.0, weight: 57.8 } }),
    prisma.checkIn.create({ data: { clientId: clients[1].id, date: daysAgo(2), mood: 3, energy: 3, sleep: 3, soreness: 2, stress: 3, trainedToday: false, followedDiet: true, waterLiters: 1.8, weight: 57.9 } }),
    prisma.checkIn.create({ data: { clientId: clients[1].id, date: daysAgo(1), mood: 4, energy: 4, sleep: 4, soreness: 1, stress: 2, trainedToday: true, followedDiet: true, waterLiters: 2.5, weight: 57.5 } }),
    // Beatriz — últimos 3 dias
    prisma.checkIn.create({ data: { clientId: clients[3].id, date: daysAgo(2), mood: 5, energy: 5, sleep: 5, soreness: 1, stress: 1, trainedToday: true, followedDiet: true, waterLiters: 2.0, weight: 55.2 } }),
    prisma.checkIn.create({ data: { clientId: clients[3].id, date: daysAgo(1), mood: 4, energy: 4, sleep: 4, soreness: 2, stress: 2, trainedToday: true, followedDiet: true, waterLiters: 2.3, weight: 55.0 } }),
  ]);
  console.log("✅ Check-ins criados");

  // ==================== CONVERSATIONS & MESSAGES ====================
  const conv1 = await prisma.conversation.create({ data: {} });
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv1.id, userId: admin.id },
      { conversationId: conv1.id, clientId: clients[0].id },
    ],
  });
  const msgTimes = (mins: number[]) => mins.map(m => {
    const d = new Date(); d.setMinutes(d.getMinutes() - m); return d;
  });
  const t1 = msgTimes([120, 115, 110, 60, 55]);
  await prisma.message.createMany({
    data: [
      { conversationId: conv1.id, senderType: "client", senderId: clients[0].id, content: "Bom dia treinador! Posso trocar o treino de amanhã para sexta?", createdAt: t1[0] },
      { conversationId: conv1.id, senderType: "user", senderId: admin.id, content: "Bom dia Miguel! Claro, sem problema. Mantenho o mesmo horário?", createdAt: t1[1] },
      { conversationId: conv1.id, senderType: "client", senderId: clients[0].id, content: "Sim, às 9h está perfeito. Obrigado!", createdAt: t1[2] },
      { conversationId: conv1.id, senderType: "user", senderId: admin.id, content: "Combinado! Já agendei. Bom treino hoje 💪", createdAt: t1[3] },
      { conversationId: conv1.id, senderType: "client", senderId: clients[0].id, content: "Obrigado! Vou dar o máximo 🔥", createdAt: t1[4] },
    ],
  });

  const conv2 = await prisma.conversation.create({ data: {} });
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conv2.id, userId: admin.id },
      { conversationId: conv2.id, clientId: clients[1].id },
    ],
  });
  const t2 = msgTimes([240, 235, 230]);
  await prisma.message.createMany({
    data: [
      { conversationId: conv2.id, senderType: "client", senderId: clients[1].id, content: "Boa tarde! Tenho sentido dores no joelho no leg press. Devo parar?", createdAt: t2[0] },
      { conversationId: conv2.id, senderType: "user", senderId: admin.id, content: "Sofia, se houver dor, pára imediatamente. Vamos substituir pelo hack squat amanhã e vemos como corre.", createdAt: t2[1] },
      { conversationId: conv2.id, senderType: "client", senderId: clients[1].id, content: "Ok, obrigada! Vou descansar hoje então.", createdAt: t2[2] },
    ],
  });
  console.log("✅ Conversas e mensagens criadas");

  // ==================== SECOND TRAINING PLAN (Push/Pull/Legs) ====================
  const planPPL = await prisma.trainingPlan.create({
    data: {
      name: "Push Pull Legs - Intermédio",
      description: "Plano de treino PPL para atletas com experiência, 6x por semana.",
      difficulty: "intermediate",
      duration: 12,
      userId: admin.id,
    },
  });
  const pushDay = await prisma.workout.create({
    data: { name: "Push Day", dayOfWeek: 1, order: 1, trainingPlanId: planPPL.id, notes: "Foco em peito, ombros e tríceps" },
  });
  await Promise.all([
    prisma.trainingExercise.create({ data: { workoutId: pushDay.id, exerciseId: exercises[0].id, sets: 4, reps: "6-8", restSeconds: 120, order: 1, notes: "Pesado" } }),
    prisma.trainingExercise.create({ data: { workoutId: pushDay.id, exerciseId: exercises[3].id, sets: 4, reps: "8-10", restSeconds: 90, order: 2 } }),
    prisma.trainingExercise.create({ data: { workoutId: pushDay.id, exerciseId: exercises[5].id, sets: 3, reps: "12-15", restSeconds: 60, order: 3 } }),
  ]);
  const pullDay = await prisma.workout.create({
    data: { name: "Pull Day", dayOfWeek: 2, order: 2, trainingPlanId: planPPL.id, notes: "Foco em costas e bíceps" },
  });
  await Promise.all([
    prisma.trainingExercise.create({ data: { workoutId: pullDay.id, exerciseId: exercises[2].id, sets: 4, reps: "5", restSeconds: 180, order: 1, notes: "Peso morto pesado" } }),
    prisma.trainingExercise.create({ data: { workoutId: pullDay.id, exerciseId: exercises[7].id, sets: 4, reps: "8-10", restSeconds: 90, order: 2 } }),
    prisma.trainingExercise.create({ data: { workoutId: pullDay.id, exerciseId: exercises[4].id, sets: 3, reps: "12", restSeconds: 60, order: 3 } }),
    prisma.trainingExercise.create({ data: { workoutId: pullDay.id, exerciseId: exercises[9].id, sets: 3, reps: "max", restSeconds: 90, order: 4 } }),
  ]);
  const legDay = await prisma.workout.create({
    data: { name: "Leg Day", dayOfWeek: 3, order: 3, trainingPlanId: planPPL.id, notes: "Foco em pernas e core" },
  });
  await Promise.all([
    prisma.trainingExercise.create({ data: { workoutId: legDay.id, exerciseId: exercises[1].id, sets: 5, reps: "5", restSeconds: 180, order: 1, notes: "Agachamento pesado" } }),
    prisma.trainingExercise.create({ data: { workoutId: legDay.id, exerciseId: exercises[8].id, sets: 4, reps: "10-12", restSeconds: 90, order: 2 } }),
    prisma.trainingExercise.create({ data: { workoutId: legDay.id, exerciseId: exercises[6].id, sets: 3, reps: "60s", restSeconds: 30, order: 3 } }),
  ]);
  // Assign PPL to Sofia
  await prisma.trainingPlanAssignment.create({
    data: { trainingPlanId: planPPL.id, clientId: clients[1].id },
  });
  console.log("✅ Plano PPL criado e atribuído à Sofia");

  // ==================== SECOND NUTRITION PLAN ====================
  const bulkPlan = await prisma.nutritionPlan.create({
    data: {
      name: "Plano Bulk - 2800 kcal",
      description: "Plano calórico para fase de ganho muscular.",
      totalCalories: 2800,
      totalProtein: 180,
      totalCarbs: 320,
      totalFat: 80,
      userId: admin.id,
    },
  });
  const bulkMeal1 = await prisma.meal.create({
    data: { name: "Pequeno-almoço", time: "07:00", order: 1, nutritionPlanId: bulkPlan.id },
  });
  await Promise.all([
    prisma.mealFood.create({ data: { mealId: bulkMeal1.id, foodId: foods[6].id, quantity: 100 } }),
    prisma.mealFood.create({ data: { mealId: bulkMeal1.id, foodId: foods[5].id, quantity: 200 } }),
    prisma.mealFood.create({ data: { mealId: bulkMeal1.id, foodId: foods[7].id, quantity: 150 } }),
  ]);
  const bulkMeal2 = await prisma.meal.create({
    data: { name: "Almoço", time: "12:30", order: 2, nutritionPlanId: bulkPlan.id },
  });
  await Promise.all([
    prisma.mealFood.create({ data: { mealId: bulkMeal2.id, foodId: foods[0].id, quantity: 250 } }),
    prisma.mealFood.create({ data: { mealId: bulkMeal2.id, foodId: foods[1].id, quantity: 200 } }),
    prisma.mealFood.create({ data: { mealId: bulkMeal2.id, foodId: foods[4].id, quantity: 150 } }),
    prisma.mealFood.create({ data: { mealId: bulkMeal2.id, foodId: foods[8].id, quantity: 15, unit: "ml" } }),
  ]);
  const bulkMeal3 = await prisma.meal.create({
    data: { name: "Jantar", time: "19:30", order: 3, nutritionPlanId: bulkPlan.id },
  });
  await Promise.all([
    prisma.mealFood.create({ data: { mealId: bulkMeal3.id, foodId: foods[3].id, quantity: 200 } }),
    prisma.mealFood.create({ data: { mealId: bulkMeal3.id, foodId: foods[2].id, quantity: 250 } }),
    prisma.mealFood.create({ data: { mealId: bulkMeal3.id, foodId: foods[4].id, quantity: 100 } }),
  ]);
  // Assign to Sofia
  await prisma.nutritionPlanAssignment.create({
    data: { nutritionPlanId: bulkPlan.id, clientId: clients[1].id },
  });
  console.log("✅ Plano de nutrição Bulk criado e atribuído à Sofia");

  // ==================== MORE BODY ASSESSMENTS ====================
  await Promise.all([
    // Sofia assessments
    prisma.bodyAssessment.create({ data: { clientId: clients[1].id, weight: 57, bodyFat: 23, muscleMass: 24, date: new Date("2025-01-10"), notes: "Avaliação inicial" } }),
    prisma.bodyAssessment.create({ data: { clientId: clients[1].id, weight: 57.5, bodyFat: 22, muscleMass: 24.5, date: new Date("2025-02-10"), notes: "Ganho muscular" } }),
    prisma.bodyAssessment.create({ data: { clientId: clients[1].id, weight: 58, bodyFat: 21.5, muscleMass: 25, date: new Date("2025-03-01"), notes: "Progressão positiva" } }),
    // Ricardo assessments
    prisma.bodyAssessment.create({ data: { clientId: clients[2].id, weight: 96, bodyFat: 26, muscleMass: 40, date: new Date("2025-01-05"), notes: "Primeira avaliação — excesso de peso" } }),
    prisma.bodyAssessment.create({ data: { clientId: clients[2].id, weight: 95, bodyFat: 25, muscleMass: 40.5, date: new Date("2025-02-05"), notes: "Ligeira melhoria" } }),
  ]);
  console.log("✅ Avaliações corporais adicionais criadas");

  // ==================== MORE BOOKING SLOTS (recurring weekly) ====================
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  await Promise.all([
    prisma.bookingSlot.create({ data: { userId: admin.id, title: "PT Individual", date: nextWeek, startTime: "08:00", endTime: "09:00", maxClients: 1 } }),
    prisma.bookingSlot.create({ data: { userId: admin.id, title: "PT Individual", date: nextWeek, startTime: "09:00", endTime: "10:00", maxClients: 1 } }),
    prisma.bookingSlot.create({ data: { userId: admin.id, title: "Aula de Grupo", type: "group", date: nextWeek, startTime: "10:00", endTime: "11:00", maxClients: 5 } }),
    prisma.bookingSlot.create({ data: { userId: admin.id, title: "PT Individual", date: nextWeek, startTime: "14:00", endTime: "15:00", maxClients: 1 } }),
    prisma.bookingSlot.create({ data: { userId: admin.id, title: "PT Individual", date: nextWeek, startTime: "15:00", endTime: "16:00", maxClients: 1 } }),
  ]);
  console.log("✅ Slots adicionais para próxima semana criados");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("📧 Login: admin@siga180.pt");
  console.log("🔑 Password: admin123");
  console.log("\n📊 Dados Demo:");
  console.log("   5 clientes (3 ativos com dados, 1 inativo, 1 pagamento em atraso)");
  console.log("   10 exercícios, 10 alimentos");
  console.log("   2 planos de treino (Full Body + PPL) atribuídos");
  console.log("   2 planos de nutrição (Cutting + Bulk) atribuídos");
  console.log("   11 check-ins, 8 avaliações corporais");
  console.log("   2 conversas com mensagens");
  console.log("   Slots de marcação para amanhã e próxima semana");
  console.log("   3 conteúdos, 3 notificações, 2 feedbacks");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
