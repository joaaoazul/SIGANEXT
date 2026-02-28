import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

// ============================================================
// COMPREHENSIVE EXERCISE DATABASE FOR PERSONAL TRAINERS
// Using free animated exercise GIFs from ExerciseDB API format
// ============================================================

const BASE_IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

interface ExerciseSeed {
  name: string;
  muscleGroup: string;
  secondaryMuscles?: string;
  equipment: string;
  difficulty: string;
  description: string;
  instructions: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

const exerciseList: ExerciseSeed[] = [
  // ==================== PEITO (Chest) ====================
  { name: "Supino Plano com Barra", muscleGroup: "chest", equipment: "Barra e banco", difficulty: "intermediate", secondaryMuscles: "Tríceps, Deltóide Anterior",
    description: "Exercício composto fundamental para desenvolvimento do peitoral.",
    instructions: "1. Deitar no banco plano, pés firmes no chão\n2. Agarrar a barra com mãos ligeiramente mais largas que os ombros\n3. Descer a barra controladamente ao meio do peito\n4. Empurrar até extensão completa sem bloquear cotovelos",
    videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    thumbnailUrl: `${BASE_IMG}/Barbell_Bench_Press/images/0.jpg` },

  { name: "Supino Inclinado com Halteres", muscleGroup: "chest", equipment: "Halteres e banco inclinado", difficulty: "intermediate", secondaryMuscles: "Tríceps, Deltóide Anterior",
    description: "Variação inclinada que enfatiza a porção clavicular (superior) do peitoral.",
    instructions: "1. Ajustar banco a 30-45°\n2. Halteres ao nível do peito, palmas para a frente\n3. Empurrar para cima convergindo ligeiramente\n4. Descer controladamente até sentir alongamento",
    videoUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
    thumbnailUrl: `${BASE_IMG}/Dumbbell_Incline_Bench_Press/images/0.jpg` },

  { name: "Supino Declinado com Barra", muscleGroup: "chest", equipment: "Barra e banco declinado", difficulty: "intermediate", secondaryMuscles: "Tríceps",
    description: "Enfatiza a porção inferior do peitoral maior.",
    instructions: "1. Deitar no banco declinado com pés presos\n2. Descer a barra à parte inferior do peito\n3. Empurrar até extensão completa\n4. Manter cotovelos a ~75° do tronco",
    videoUrl: "https://www.youtube.com/watch?v=LfyQBUKR8SE" },

  { name: "Crossover de Cabos (Peck Deck)", muscleGroup: "chest", equipment: "Cabos / Máquina", difficulty: "beginner", secondaryMuscles: "Deltóide Anterior",
    description: "Exercício de isolamento que permite uma contração completa do peitoral.",
    instructions: "1. Colocar as polias em posição alta\n2. Passo à frente, tronco ligeiramente inclinado\n3. Trazer as mãos para o centro com cotovelos ligeiramente fletidos\n4. Contrair o peito no topo e voltar controladamente",
    videoUrl: "https://www.youtube.com/watch?v=taI4XduLpTk" },

  { name: "Flexões (Push-ups)", muscleGroup: "chest", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "Tríceps, Core, Deltóide",
    description: "Exercício clássico de peso corporal para peito, ombros e tríceps.",
    instructions: "1. Mãos ligeiramente mais largas que ombros\n2. Corpo reto da cabeça aos pés\n3. Descer até peito quase tocar o chão\n4. Empurrar até extensão completa",
    videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    thumbnailUrl: `${BASE_IMG}/Push-Up/images/0.jpg` },

  { name: "Chest Press na Máquina", muscleGroup: "chest", equipment: "Máquina", difficulty: "beginner", secondaryMuscles: "Tríceps",
    description: "Versão guiada do supino, ideal para iniciantes ou para isolar o peito.",
    instructions: "1. Ajustar o assento para que os punhos fiquem ao nível do peito\n2. Empurrar para a frente até extensão quase completa\n3. Voltar controladamente sem deixar o peso cair" },

  { name: "Aberturas com Halteres", muscleGroup: "chest", equipment: "Halteres e banco", difficulty: "intermediate", secondaryMuscles: "Deltóide Anterior",
    description: "Exercício de isolamento que alonga e contrai o peitoral.",
    instructions: "1. Deitar no banco plano com halteres acima do peito\n2. Abrir os braços em arco com cotovelos ligeiramente fletidos\n3. Descer até sentir alongamento no peito\n4. Voltar à posição inicial contraindo o peitoral",
    videoUrl: "https://www.youtube.com/watch?v=eozdVDA78K0",
    thumbnailUrl: `${BASE_IMG}/Dumbbell_Fly/images/0.jpg` },

  { name: "Dips (Paralelas)", muscleGroup: "chest", equipment: "Paralelas", difficulty: "advanced", secondaryMuscles: "Tríceps, Deltóide Anterior",
    description: "Exercício avançado de peso corporal para peito inferior e tríceps.",
    instructions: "1. Agarrar as paralelas e subir\n2. Inclinar ligeiramente o tronco para a frente\n3. Descer até os braços formarem 90°\n4. Empurrar de volta à posição inicial",
    videoUrl: "https://www.youtube.com/watch?v=2z8JmcrW-As" },

  // ==================== COSTAS (Back) ====================
  { name: "Peso Morto (Deadlift)", muscleGroup: "back", equipment: "Barra", difficulty: "advanced", secondaryMuscles: "Glúteos, Isquiotibiais, Core",
    description: "O exercício mais completo para a cadeia posterior. Fundamental para força.",
    instructions: "1. Pés à largura dos ombros, barra sobre o meio dos pés\n2. Agarrar a barra, costas retas, peito levantado\n3. Levantar empurrando o chão com os pés\n4. Extensão completa das ancas no topo\n5. Descer controladamente mantendo a barra junto ao corpo",
    videoUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q",
    thumbnailUrl: `${BASE_IMG}/Barbell_Deadlift/images/0.jpg` },

  { name: "Remada com Barra", muscleGroup: "back", equipment: "Barra", difficulty: "intermediate", secondaryMuscles: "Bíceps, Deltóide Posterior",
    description: "Exercício composto essencial para espessura das costas.",
    instructions: "1. Agarrar a barra pronada, tronco inclinado a ~45°\n2. Puxar a barra ao abdómen inferior\n3. Contrair as omoplatas no topo\n4. Descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=FWJR5Ve8bnQ",
    thumbnailUrl: `${BASE_IMG}/Barbell_Bent_Over_Row/images/0.jpg` },

  { name: "Elevações (Pull-ups)", muscleGroup: "back", equipment: "Barra fixa", difficulty: "advanced", secondaryMuscles: "Bíceps, Antebraços",
    description: "Exercício rei para largura das costas. Trabalha o grande dorsal intensamente.",
    instructions: "1. Agarrar a barra pronada, mãos mais largas que ombros\n2. Puxar o corpo até o queixo passar a barra\n3. Controlar a descida completamente\n4. Evitar balancear",
    videoUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    thumbnailUrl: `${BASE_IMG}/Pull-Up/images/0.jpg` },

  { name: "Puxada Frontal (Lat Pulldown)", muscleGroup: "back", equipment: "Máquina de cabos", difficulty: "beginner", secondaryMuscles: "Bíceps",
    description: "Versão assistida das elevações. Excelente para desenvolver o grande dorsal.",
    instructions: "1. Sentar na máquina, agarrar a barra larga\n2. Puxar a barra ao peito superior\n3. Contrair as omoplatas no final\n4. Voltar controladamente",
    videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc" },

  { name: "Remada Unilateral com Haltere", muscleGroup: "back", equipment: "Haltere e banco", difficulty: "beginner", secondaryMuscles: "Bíceps, Core",
    description: "Permite trabalhar cada lado independentemente, corrigindo assimetrias.",
    instructions: "1. Apoiar joelho e mão no banco\n2. Haltere na mão oposta, braço estendido\n3. Puxar o haltere à anca\n4. Contrair a omoplata no topo",
    videoUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8",
    thumbnailUrl: `${BASE_IMG}/Dumbbell_Row/images/0.jpg` },

  { name: "Remada Sentado no Cabo", muscleGroup: "back", equipment: "Máquina de cabos", difficulty: "beginner", secondaryMuscles: "Bíceps, Deltóide Posterior",
    description: "Exercício de cabos para espessura das costas com tensão constante.",
    instructions: "1. Sentar com pés apoiados, agarrar pega triângulo\n2. Puxar ao abdómen mantendo costas retas\n3. Contrair omoplatas\n4. Estender controladamente",
    videoUrl: "https://www.youtube.com/watch?v=GZbfZ033f74" },

  { name: "Pullover com Haltere", muscleGroup: "back", equipment: "Haltere e banco", difficulty: "intermediate", secondaryMuscles: "Peito, Serrátil",
    description: "Exercício único que trabalha costas e peito simultaneamente.",
    instructions: "1. Deitar transversalmente no banco\n2. Haltere acima do peito com braços estendidos\n3. Descer atrás da cabeça em arco controlado\n4. Voltar à posição inicial",
    videoUrl: "https://www.youtube.com/watch?v=FK4rHfWKEac" },

  { name: "T-Bar Row", muscleGroup: "back", equipment: "Barra T / Landmine", difficulty: "intermediate", secondaryMuscles: "Bíceps, Trapézio",
    description: "Remada com pegada neutra para espessura do meio das costas.",
    instructions: "1. Posicionar sobre a barra T\n2. Agarrar com ambas as mãos, tronco inclinado\n3. Puxar ao peito/abdómen\n4. Contrair e descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=j3Igk5nyZE4" },

  { name: "Face Pull", muscleGroup: "back", equipment: "Cabo com corda", difficulty: "beginner", secondaryMuscles: "Deltóide Posterior, Trapézio",
    description: "Excelente para saúde do ombro e postura. Trabalha a parte posterior.",
    instructions: "1. Cabo na posição alta com corda\n2. Puxar em direção ao rosto\n3. Abrir as mãos no final do movimento\n4. Controlar o retorno lentamente",
    videoUrl: "https://www.youtube.com/watch?v=rep-qVOkqgk" },

  // ==================== PERNAS (Legs) ====================
  { name: "Agachamento com Barra (Squat)", muscleGroup: "legs", equipment: "Barra e rack", difficulty: "intermediate", secondaryMuscles: "Glúteos, Core, Eretores",
    description: "O rei dos exercícios. Fundamental para força e hipertrofia das pernas.",
    instructions: "1. Barra nas costas (trapézio superior)\n2. Pés à largura dos ombros ou ligeiramente mais\n3. Descer quebrando nos joelhos e ancas simultaneamente\n4. Descer até pelo menos paralelo\n5. Empurrar o chão para subir mantendo o peito alto",
    videoUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    thumbnailUrl: `${BASE_IMG}/Barbell_Squat/images/0.jpg` },

  { name: "Agachamento Frontal", muscleGroup: "legs", equipment: "Barra e rack", difficulty: "advanced", secondaryMuscles: "Core, Quadríceps (ênfase)",
    description: "Variação que enfatiza os quadríceps e exige grande mobilidade.",
    instructions: "1. Barra na frente dos ombros, cotovelos altos\n2. Descer mantendo tronco o mais vertical possível\n3. Joelhos avançam sobre os dedos dos pés\n4. Subir mantendo cotovelos altos",
    videoUrl: "https://www.youtube.com/watch?v=m4ytaCJZpl0" },

  { name: "Leg Press", muscleGroup: "legs", equipment: "Máquina Leg Press", difficulty: "beginner", secondaryMuscles: "Glúteos",
    description: "Exercício de máquina que permite trabalhar pernas com grande carga.",
    instructions: "1. Sentar na máquina, pés à largura dos ombros na plataforma\n2. Libertartraves de segurança\n3. Descer até 90° nos joelhos\n4. Empurrar sem bloquear totalmente os joelhos",
    videoUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ" },

  { name: "Agachamento Búlgaro", muscleGroup: "legs", equipment: "Halteres e banco", difficulty: "intermediate", secondaryMuscles: "Glúteos, Core",
    description: "Exercício unilateral excelente para força e equilíbrio muscular.",
    instructions: "1. Pé traseiro elevado no banco\n2. Descer até o joelho traseiro quase tocar o chão\n3. Manter tronco direito\n4. Empurrar com a perna da frente",
    videoUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE" },

  { name: "Extensão de Pernas (Leg Extension)", muscleGroup: "legs", equipment: "Máquina", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício de isolamento para os quadríceps.",
    instructions: "1. Sentar na máquina, rolos nos tornozelos\n2. Estender as pernas até posição horizontal\n3. Contrair o quadríceps no topo\n4. Descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=YyvSfVjQeL0" },

  { name: "Curl de Pernas (Leg Curl)", muscleGroup: "legs", equipment: "Máquina", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício de isolamento para os isquiotibiais (parte posterior da coxa).",
    instructions: "1. Deitar na máquina, rolo nos tornozelos\n2. Fletir os joelhos trazendo os pés aos glúteos\n3. Contrair no topo\n4. Estender controladamente",
    videoUrl: "https://www.youtube.com/watch?v=1Tq3QdYUuHs" },

  { name: "Peso Morto Romeno", muscleGroup: "legs", equipment: "Barra ou halteres", difficulty: "intermediate", secondaryMuscles: "Glúteos, Eretores da Coluna",
    description: "Variação do deadlift focada nos isquiotibiais e glúteos.",
    instructions: "1. Barra nas mãos, pés à largura das ancas\n2. Deslizar a barra pelas coxas, empurrando o rabo para trás\n3. Descer até sentir alongamento nos isquiotibiais\n4. Subir contraindo glúteos no topo",
    videoUrl: "https://www.youtube.com/watch?v=JCXUYQp7AkM" },

  { name: "Lunge com Halteres (Afundo)", muscleGroup: "legs", equipment: "Halteres", difficulty: "beginner", secondaryMuscles: "Glúteos, Core",
    description: "Exercício funcional unilateral para pernas e glúteos.",
    instructions: "1. Halteres nas mãos, pés juntos\n2. Passo largo à frente\n3. Descer até ambos os joelhos a 90°\n4. Empurrar de volta à posição inicial\n5. Alternar pernas",
    videoUrl: "https://www.youtube.com/watch?v=D7KaRcUTQeE",
    thumbnailUrl: `${BASE_IMG}/Dumbbell_Lunge/images/0.jpg` },

  { name: "Hack Squat", muscleGroup: "legs", equipment: "Máquina Hack", difficulty: "intermediate", secondaryMuscles: "Glúteos",
    description: "Agachamento guiado na máquina que isola os quadríceps.",
    instructions: "1. Costas apoiadas no encosto, ombros nos suportes\n2. Pés à frente na plataforma\n3. Descer até 90° ou mais\n4. Empurrar sem bloquear joelhos",
    videoUrl: "https://www.youtube.com/watch?v=0tn5K9NlCfo" },

  { name: "Elevação de Gémeos em Pé", muscleGroup: "legs", equipment: "Máquina ou degrau", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício de isolamento para os gémeos (gastrocnémio e sóleo).",
    instructions: "1. Em pé na máquina ou num degrau\n2. Pontas dos pés na borda\n3. Subir na ponta dos pés o mais alto possível\n4. Descer abaixo do nível do degrau para alongar\n5. Pausa de 1s no topo",
    videoUrl: "https://www.youtube.com/watch?v=3UWi44yN-wM" },

  { name: "Hip Thrust", muscleGroup: "legs", equipment: "Barra e banco", difficulty: "intermediate", secondaryMuscles: "Isquiotibiais, Core",
    description: "O melhor exercício para ativação e hipertrofia dos glúteos.",
    instructions: "1. Costas apoiadas no banco, barra sobre as ancas (com pad)\n2. Pés no chão à largura das ancas\n3. Empurrar as ancas para cima até extensão completa\n4. Contrair glúteos no topo\n5. Descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=SEdqd1n0cvg" },

  { name: "Leg Press 45° (Pés juntos)", muscleGroup: "legs", equipment: "Máquina Leg Press", difficulty: "intermediate", secondaryMuscles: "Quadríceps (ênfase)",
    description: "Variação com pés juntos e baixos para maior ênfase nos quadríceps.",
    instructions: "1. Pés juntos na parte inferior da plataforma\n2. Descer controladamente até ~90°\n3. Empurrar sem bloquear joelhos\n4. Manter lombar colada ao encosto" },

  // ==================== OMBROS (Shoulders) ====================
  { name: "Press Militar com Barra", muscleGroup: "shoulders", equipment: "Barra", difficulty: "intermediate", secondaryMuscles: "Tríceps, Trapézio",
    description: "Exercício composto principal para desenvolvimento dos ombros.",
    instructions: "1. Barra ao nível dos ombros, pega ligeiramente mais larga\n2. Empurrar verticalmente acima da cabeça\n3. Extensão completa no topo\n4. Descer controladamente aos ombros",
    videoUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI" },

  { name: "Press de Ombros com Halteres", muscleGroup: "shoulders", equipment: "Halteres", difficulty: "beginner", secondaryMuscles: "Tríceps",
    description: "Variação com halteres que permite maior amplitude e trabalho unilateral.",
    instructions: "1. Sentado ou em pé, halteres ao nível dos ombros\n2. Palmas para a frente\n3. Empurrar para cima até extensão\n4. Descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
    thumbnailUrl: `${BASE_IMG}/Dumbbell_Shoulder_Press/images/0.jpg` },

  { name: "Elevações Laterais", muscleGroup: "shoulders", equipment: "Halteres", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício de isolamento para o deltóide lateral — dá largura aos ombros.",
    instructions: "1. Halteres ao lado do corpo\n2. Elevar lateralmente até nível dos ombros\n3. Ligeira inclinação dos halteres (polegar levemente para baixo)\n4. Descer controladamente\n5. Não usar impulso",
    videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo" },

  { name: "Elevações Frontais", muscleGroup: "shoulders", equipment: "Halteres ou barra", difficulty: "beginner", secondaryMuscles: "",
    description: "Isolamento do deltóide anterior.",
    instructions: "1. Halteres à frente das coxas\n2. Elevar à frente até nível dos ombros\n3. Manter braços quase estendidos\n4. Descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=gzDe-KLMhSk" },

  { name: "Elevações Posteriores (Reverse Fly)", muscleGroup: "shoulders", equipment: "Halteres", difficulty: "beginner", secondaryMuscles: "Trapézio, Rombóides",
    description: "Isolamento do deltóide posterior, fundamental para postura e equilíbrio.",
    instructions: "1. Inclinado para a frente (~75° de inclinação)\n2. Halteres pendurados à frente\n3. Abrir os braços lateralmente com cotovelos ligeiramente fletidos\n4. Contrair omoplatas no topo",
    videoUrl: "https://www.youtube.com/watch?v=lOCse3urMFA" },

  { name: "Arnold Press", muscleGroup: "shoulders", equipment: "Halteres", difficulty: "intermediate", secondaryMuscles: "Tríceps",
    description: "Variação rotacional que trabalha todas as porções do deltóide.",
    instructions: "1. Halteres à frente do peito, palmas para si\n2. Empurrar para cima rodando as palmas para a frente\n3. Extensão completa no topo com palmas para a frente\n4. Inverter o movimento na descida",
    videoUrl: "https://www.youtube.com/watch?v=6Z15_WdXmVw" },

  { name: "Shrugs (Encolhimento de Ombros)", muscleGroup: "shoulders", equipment: "Barra ou halteres", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício de isolamento para o trapézio superior.",
    instructions: "1. Peso nas mãos ao lado do corpo\n2. Encolher os ombros para cima\n3. Pausa 1-2s no topo\n4. Descer controladamente\n5. Não rodar os ombros",
    videoUrl: "https://www.youtube.com/watch?v=cJRVVxmytaM" },

  { name: "Upright Row (Remada Alta)", muscleGroup: "shoulders", equipment: "Barra ou halteres", difficulty: "intermediate", secondaryMuscles: "Trapézio, Bíceps",
    description: "Exercício composto para ombros e trapézio.",
    instructions: "1. Barra ou halteres nas mãos, pega estreita\n2. Puxar para cima junto ao corpo\n3. Cotovelos acima dos ombros\n4. Descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=amCU-ziHITM" },

  // ==================== BRAÇOS - BÍCEPS (Arms) ====================
  { name: "Curl com Barra", muscleGroup: "arms", equipment: "Barra reta ou EZ", difficulty: "beginner", secondaryMuscles: "Antebraço",
    description: "O exercício mais clássico para os bíceps.",
    instructions: "1. Barra nas mãos, pega supinada (palmas para cima)\n2. Cotovelos colados ao corpo\n3. Fletir os cotovelos contraindo o bíceps\n4. Descer controladamente sem balancear",
    videoUrl: "https://www.youtube.com/watch?v=kwG2ipFRgFo",
    thumbnailUrl: `${BASE_IMG}/Barbell_Curl/images/0.jpg` },

  { name: "Curl com Halteres Alternado", muscleGroup: "arms", equipment: "Halteres", difficulty: "beginner", secondaryMuscles: "Antebraço",
    description: "Variação que permite focar cada braço individualmente.",
    instructions: "1. Halteres ao lado do corpo, palmas para a frente\n2. Fletir um braço de cada vez\n3. Supinar durante o movimento\n4. Descer controladamente e alternar" },

  { name: "Curl Martelo (Hammer Curl)", muscleGroup: "arms", equipment: "Halteres", difficulty: "beginner", secondaryMuscles: "Braquiorradial",
    description: "Trabalha o bíceps e o braquiorradial (antebraço). Pega neutra.",
    instructions: "1. Halteres ao lado do corpo, palmas viradas para dentro\n2. Fletir mantendo a pega neutra (martelo)\n3. Contrair no topo\n4. Descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4" },

  { name: "Curl Concentrado", muscleGroup: "arms", equipment: "Haltere", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício de isolamento máximo para o pico do bíceps.",
    instructions: "1. Sentado, cotovelo apoiado no interior da coxa\n2. Haltere na mão, braço estendido\n3. Fletir lentamente contraindo o bíceps\n4. Contrair no topo e descer lentamente",
    videoUrl: "https://www.youtube.com/watch?v=Jvj2wV0vOYU" },

  { name: "Curl na Máquina", muscleGroup: "arms", equipment: "Máquina", difficulty: "beginner", secondaryMuscles: "",
    description: "Curl guiado na máquina para isolamento seguro do bíceps.",
    instructions: "1. Ajustar braço na almofada\n2. Fletir o cotovelo contraindo o bíceps\n3. Contrair no topo\n4. Descer controladamente" },

  { name: "Curl com Barra no Banco Scott", muscleGroup: "arms", equipment: "Barra EZ e banco Scott", difficulty: "intermediate", secondaryMuscles: "",
    description: "Isolamento do bíceps com apoio para evitar compensações.",
    instructions: "1. Braços apoiados no banco Scott\n2. Barra EZ supinada\n3. Fletir completamente\n4. Descer até quase extensão total sem perder tensão",
    videoUrl: "https://www.youtube.com/watch?v=fIWP-FRFUNU" },

  // ==================== BRAÇOS - TRÍCEPS ====================
  { name: "Extensão de Tríceps com Corda (Cabo)", muscleGroup: "arms", equipment: "Cabo com corda", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício de isolamento do tríceps com cabos para tensão constante.",
    instructions: "1. Polia alta, agarrar a corda\n2. Cotovelos colados ao tronco\n3. Estender completamente, abrindo a corda em baixo\n4. Voltar controladamente",
    videoUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU" },

  { name: "Extensão de Tríceps Overhead", muscleGroup: "arms", equipment: "Haltere ou cabo", difficulty: "intermediate", secondaryMuscles: "",
    description: "Trabalha a porção longa do tríceps com o braço acima da cabeça.",
    instructions: "1. Haltere ou corda acima da cabeça\n2. Cotovelos apontados para cima, junto à cabeça\n3. Estender os braços acima da cabeça\n4. Descer controladamente atrás da cabeça",
    videoUrl: "https://www.youtube.com/watch?v=_gsUck-7M74" },

  { name: "Supino Fechado (Close Grip Bench Press)", muscleGroup: "arms", equipment: "Barra e banco", difficulty: "intermediate", secondaryMuscles: "Peito, Deltóide Anterior",
    description: "Exercício composto que enfatiza o tríceps com carga pesada.",
    instructions: "1. Deitar no banco plano\n2. Pega mais estreita que ombros (~30cm entre mãos)\n3. Descer ao peito com cotovelos junto ao corpo\n4. Empurrar até extensão",
    videoUrl: "https://www.youtube.com/watch?v=nEF0bv2FW94" },

  { name: "Kickback de Tríceps", muscleGroup: "arms", equipment: "Haltere", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício de isolamento para a porção lateral do tríceps.",
    instructions: "1. Inclinado para a frente, cotovelo a 90°\n2. Estender o braço para trás\n3. Contrair o tríceps no topo\n4. Voltar controladamente a 90°",
    videoUrl: "https://www.youtube.com/watch?v=6SS6K3lAwZ8" },

  { name: "Skull Crushers (Extensão Deitado)", muscleGroup: "arms", equipment: "Barra EZ e banco", difficulty: "intermediate", secondaryMuscles: "",
    description: "Clássico exercício de isolamento do tríceps deitado no banco.",
    instructions: "1. Deitado no banco, barra EZ acima do peito\n2. Fletir os cotovelos trazendo a barra à testa\n3. Estender os braços voltando à posição inicial\n4. Manter cotovelos fixos e apontados para o teto",
    videoUrl: "https://www.youtube.com/watch?v=d_KZxkY_0cM" },

  { name: "Dips no Banco (Bench Dips)", muscleGroup: "arms", equipment: "Banco", difficulty: "beginner", secondaryMuscles: "Peito, Deltóide Anterior",
    description: "Exercício de peso corporal para tríceps usando um banco.",
    instructions: "1. Mãos no banco atrás, pernas estendidas\n2. Descer dobrando os cotovelos até ~90°\n3. Empurrar de volta à posição inicial\n4. Manter costas junto ao banco" },

  // ==================== CORE / ABDOMINAIS ====================
  { name: "Prancha Abdominal (Plank)", muscleGroup: "core", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "Ombros, Glúteos",
    description: "Exercício isométrico fundamental para estabilidade do core.",
    instructions: "1. Antebraços e pontas dos pés no chão\n2. Corpo em linha reta da cabeça aos pés\n3. Abdómen contraído, omoplatas afastadas\n4. Manter 30-60 segundos\n5. Não deixar as ancas subir ou descer",
    videoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    thumbnailUrl: `${BASE_IMG}/Front_Plank/images/0.jpg` },

  { name: "Prancha Lateral", muscleGroup: "core", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "Oblíquos",
    description: "Trabalha os oblíquos e a estabilidade lateral do core.",
    instructions: "1. Apoiar num antebraço e lado do pé\n2. Corpo em linha reta\n3. Anca elevada\n4. Manter 20-45s cada lado" },

  { name: "Crunch Abdominal", muscleGroup: "core", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício clássico para o reto abdominal superior.",
    instructions: "1. Deitado, joelhos fletidos, mãos na cabeça\n2. Elevar os ombros do chão contraindo o abdómen\n3. Não puxar o pescoço\n4. Descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=Xyd_fa5zoEU" },

  { name: "Elevação de Pernas (Leg Raise)", muscleGroup: "core", equipment: "Peso corporal / Barra fixa", difficulty: "intermediate", secondaryMuscles: "Flexores da anca",
    description: "Exercício para o reto abdominal inferior.",
    instructions: "1. Deitado ou pendurado numa barra fixa\n2. Pernas juntas e estendidas\n3. Elevar as pernas até 90°\n4. Descer controladamente sem tocar o chão",
    videoUrl: "https://www.youtube.com/watch?v=JB2oyawG9KI" },

  { name: "Russian Twist", muscleGroup: "core", equipment: "Peso corporal ou bola medicinal", difficulty: "intermediate", secondaryMuscles: "Oblíquos",
    description: "Exercício rotacional para os oblíquos.",
    instructions: "1. Sentado, tronco inclinado para trás (~45°)\n2. Pés levantados (opção) ou no chão\n3. Rodar o tronco para cada lado\n4. Tocar o chão com as mãos/peso de cada lado",
    videoUrl: "https://www.youtube.com/watch?v=wkD8rjkodUI" },

  { name: "Ab Wheel Rollout", muscleGroup: "core", equipment: "Roda abdominal", difficulty: "advanced", secondaryMuscles: "Ombros, Costas",
    description: "Exercício avançado para todo o core e estabilidade.",
    instructions: "1. Joelhos no chão, roda à frente\n2. Rolar para a frente estendendo o corpo\n3. Manter abdómen contraído\n4. Puxar de volta à posição inicial",
    videoUrl: "https://www.youtube.com/watch?v=uYBOBBv9GzY" },

  { name: "Mountain Climbers", muscleGroup: "core", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "Ombros, Quadríceps, Cardio",
    description: "Exercício dinâmico que combina core com cardio.",
    instructions: "1. Posição de prancha alta (mãos estendidas)\n2. Trazer alternadamente cada joelho ao peito\n3. Manter ancas baixas\n4. Ritmo rápido para cardio, lento para core",
    videoUrl: "https://www.youtube.com/watch?v=nmwgirgXLYM" },

  { name: "Bicycle Crunch", muscleGroup: "core", equipment: "Peso corporal", difficulty: "intermediate", secondaryMuscles: "Oblíquos",
    description: "Um dos exercícios mais eficazes para ativação abdominal total.",
    instructions: "1. Deitado, mãos na cabeça, pernas elevadas\n2. Tocar cotovelo no joelho oposto\n3. Estender a perna oposta\n4. Alternar lados como pedalar",
    videoUrl: "https://www.youtube.com/watch?v=9FGilxCbdz8" },

  { name: "Dead Bug", muscleGroup: "core", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "",
    description: "Exercício anti-extensão excelente para estabilidade do core. Seguro para a lombar.",
    instructions: "1. Deitado de costas, braços estendidos ao teto\n2. Joelhos fletidos a 90°\n3. Estender braço e perna opostos simultaneamente\n4. Manter lombar colada ao chão\n5. Alternar lados",
    videoUrl: "https://www.youtube.com/watch?v=4XLEnwUr1d8" },

  // ==================== CARDIO ====================
  { name: "Corrida na Passadeira", muscleGroup: "cardio", equipment: "Passadeira", difficulty: "beginner", secondaryMuscles: "Pernas, Core",
    description: "Cardio aeróbico básico na passadeira.",
    instructions: "1. Começar com 5 min de aquecimento a caminhar\n2. Aumentar velocidade progressivamente\n3. Manter postura ereta\n4. Terminar com 3-5 min de arrefecimento" },

  { name: "Intervalos HIIT na Passadeira", muscleGroup: "cardio", equipment: "Passadeira", difficulty: "advanced", secondaryMuscles: "Pernas, Core",
    description: "Treino intervalado de alta intensidade para queima de gordura.",
    instructions: "1. Aquecer 5 min\n2. Sprint 30s a velocidade alta\n3. Recuperação ativa 60s a velocidade baixa\n4. Repetir 8-12 rondas\n5. Arrefecimento 5 min" },

  { name: "Bicicleta Estática", muscleGroup: "cardio", equipment: "Bicicleta estática", difficulty: "beginner", secondaryMuscles: "Pernas",
    description: "Cardio de baixo impacto na bicicleta estática.",
    instructions: "1. Ajustar assento à altura das ancas\n2. Pedalar a ritmo constante\n3. Alternar entre resistência alta e baixa\n4. Manter cadência de 70-90 RPM" },

  { name: "Remo Ergómetro", muscleGroup: "cardio", equipment: "Remo", difficulty: "intermediate", secondaryMuscles: "Costas, Pernas, Core",
    description: "Cardio de corpo inteiro com baixo impacto articular.",
    instructions: "1. Pés nas pedaleiras, agarrar a pega\n2. Empurrar com as pernas primeiro\n3. Inclinar tronco ligeiramente para trás\n4. Puxar a pega ao abdómen\n5. Voltar na ordem inversa",
    videoUrl: "https://www.youtube.com/watch?v=jh_snMM8VM0" },

  { name: "Saltar à Corda", muscleGroup: "cardio", equipment: "Corda de saltar", difficulty: "intermediate", secondaryMuscles: "Gémeos, Ombros, Core",
    description: "Cardio eficiente e portátil. Excelente para coordenação.",
    instructions: "1. Corda ao tamanho correto (pegas ao nível das axilas)\n2. Saltar com os pés juntos, saltos pequenos\n3. Rodar a corda com os pulsos, não com os braços\n4. Manter core contraído" },

  { name: "Burpees", muscleGroup: "cardio", equipment: "Peso corporal", difficulty: "advanced", secondaryMuscles: "Peito, Pernas, Core",
    description: "Exercício de corpo inteiro combinando cardio e força. Muito intenso.",
    instructions: "1. De pé, agachar e colocar mãos no chão\n2. Saltar pés para trás (posição de prancha)\n3. Fazer uma flexão\n4. Saltar pés para a frente\n5. Saltar verticalmente com braços acima da cabeça",
    videoUrl: "https://www.youtube.com/watch?v=dZgVxmf6jkA" },

  { name: "Battle Ropes", muscleGroup: "cardio", equipment: "Cordas de batalha", difficulty: "intermediate", secondaryMuscles: "Ombros, Braços, Core",
    description: "Exercício de condicionamento com cordas pesadas.",
    instructions: "1. Agarrar uma corda em cada mão\n2. Alternar ondas rápidas (alternating waves)\n3. Manter posição de semi-agachamento\n4. Core contraído durante todo o exercício" },

  // ==================== CORPO INTEIRO (Full Body) ====================
  { name: "Clean and Press", muscleGroup: "full_body", equipment: "Barra", difficulty: "advanced", secondaryMuscles: "Ombros, Pernas, Core",
    description: "Exercício olímpico que trabalha todo o corpo num só movimento.",
    instructions: "1. Barra no chão, pega na largura dos ombros\n2. Puxar explosivamente (clean) até aos ombros\n3. Empurrar acima da cabeça (press)\n4. Voltar controladamente",
    videoUrl: "https://www.youtube.com/watch?v=SkMQBaBSlLA" },

  { name: "Turkish Get-Up", muscleGroup: "full_body", equipment: "Kettlebell", difficulty: "advanced", secondaryMuscles: "Core, Ombros, Pernas",
    description: "Exercício complexo de mobilidade, estabilidade e força total.",
    instructions: "1. Deitado com kettlebell na mão estendida ao teto\n2. Seguir sequência de movimentos para ficar de pé\n3. Manter o braço estendido durante todo o movimento\n4. Inverter o processo para deitar",
    videoUrl: "https://www.youtube.com/watch?v=0bWRPC49-KI" },

  { name: "Kettlebell Swing", muscleGroup: "full_body", equipment: "Kettlebell", difficulty: "intermediate", secondaryMuscles: "Glúteos, Isquiotibiais, Core",
    description: "Exercício balístico excelente para potência e condicionamento.",
    instructions: "1. Pés ligeiramente mais largos que ombros\n2. Kettlebell entre as pernas\n3. Extensão explosiva das ancas\n4. Kettlebell sobe até nível dos ombros\n5. Controlar o retorno entre as pernas",
    videoUrl: "https://www.youtube.com/watch?v=YSxHifyI6s8" },

  { name: "Thruster (Barra)", muscleGroup: "full_body", equipment: "Barra", difficulty: "intermediate", secondaryMuscles: "Quadríceps, Ombros, Core",
    description: "Combinação de agachamento frontal com press — muito intenso.",
    instructions: "1. Barra na posição de agachamento frontal\n2. Agachar completamente\n3. Subir explosivamente e empurrar a barra acima da cabeça\n4. Baixar a barra aos ombros e repetir",
    videoUrl: "https://www.youtube.com/watch?v=PoHxEqHeHSs" },

  { name: "Man Makers", muscleGroup: "full_body", equipment: "Halteres", difficulty: "advanced", secondaryMuscles: "Todas as partes do corpo",
    description: "Exercício extremamente intenso que combina múltiplos movimentos.",
    instructions: "1. Com halteres no chão: flexão\n2. Remada com cada braço\n3. Saltar pés para a frente\n4. Clean até aos ombros\n5. Press acima da cabeça\n6. Descer e repetir" },

  { name: "Bear Crawl", muscleGroup: "full_body", equipment: "Peso corporal", difficulty: "intermediate", secondaryMuscles: "Core, Ombros, Quadríceps",
    description: "Exercício de locomoção animal para condicionamento e core.",
    instructions: "1. Posição de gatinhas, joelhos ligeiramente elevados\n2. Mover mão e pé opostos em simultâneo\n3. Manter as ancas baixas e o core contraído\n4. Avançar ou recuar 10-20 metros" },

  // ==================== EXERCÍCIOS COM ELÁSTICOS ====================
  { name: "Band Pull Apart", muscleGroup: "shoulders", equipment: "Elástico", difficulty: "beginner", secondaryMuscles: "Trapézio, Rombóides",
    description: "Exercício de pré-habilitação para saúde dos ombros e postura.",
    instructions: "1. Elástico à frente ao nível do peito\n2. Braços estendidos\n3. Abrir os braços para os lados esticando o elástico\n4. Contrair omoplatas\n5. Voltar controladamente" },

  { name: "Agachamento com Elástico", muscleGroup: "legs", equipment: "Elástico", difficulty: "beginner", secondaryMuscles: "Glúteos",
    description: "Agachamento com resistência adicional do elástico.",
    instructions: "1. Elástico debaixo dos pés, agarrado nos ombros\n2. Agachar como num agachamento normal\n3. Subir contra a resistência do elástico\n4. Manter peito alto" },

  // ==================== EXERCÍCIOS DE MOBILIDADE / AQUECIMENTO ====================
  { name: "Cat-Cow (Gato-Vaca)", muscleGroup: "core", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "Coluna, Eretores",
    description: "Exercício de mobilidade para a coluna. Ideal para aquecimento.",
    instructions: "1. Posição de 4 apoios (mãos e joelhos)\n2. Inspirar: arquear as costas (vaca) — olhar para cima\n3. Expirar: arredondar as costas (gato) — olhar umbigo\n4. Repetir 10-15 vezes" },

  { name: "Agachamento Goblet", muscleGroup: "legs", equipment: "Haltere ou kettlebell", difficulty: "beginner", secondaryMuscles: "Core, Glúteos",
    description: "Variação do agachamento com peso à frente. Excelente para aprender técnica.",
    instructions: "1. Segurar haltere/kettlebell junto ao peito\n2. Pés ligeiramente mais largos que ombros\n3. Agachar mantendo cotovelos entre os joelhos\n4. Subir empurrando o chão",
    videoUrl: "https://www.youtube.com/watch?v=MxsFDhcyFyE" },

  { name: "Glute Bridge", muscleGroup: "legs", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "Core, Isquiotibiais",
    description: "Ativação básica dos glúteos. Perfeito para aquecimento.",
    instructions: "1. Deitado de costas, joelhos fletidos, pés no chão\n2. Empurrar as ancas para cima\n3. Contrair os glúteos no topo\n4. Descer controladamente",
    videoUrl: "https://www.youtube.com/watch?v=OUgsJ8-Vi0E" },

  { name: "Rotação da Anca (Hip Circle)", muscleGroup: "legs", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "Flexores da anca",
    description: "Mobilidade articular para as ancas. Aquecimento essencial.",
    instructions: "1. De pé, elevar um joelho\n2. Rodar o joelho para fora em círculo\n3. 10 rotações para cada lado\n4. Repetir com a outra perna" },

  { name: "Inchworm (Minhoca)", muscleGroup: "full_body", equipment: "Peso corporal", difficulty: "beginner", secondaryMuscles: "Isquiotibiais, Ombros, Core",
    description: "Exercício de mobilidade dinâmica para aquecimento completo.",
    instructions: "1. De pé, inclinar e tocar o chão\n2. Caminhar com as mãos até posição de prancha\n3. Opcional: fazer uma flexão\n4. Caminhar com os pés até às mãos\n5. Subir e repetir" },

  // ==================== EXERCÍCIOS DE MÁQUINA ADICIONAIS ====================
  { name: "Peck Deck (Butterfly)", muscleGroup: "chest", equipment: "Máquina Peck Deck", difficulty: "beginner", secondaryMuscles: "Deltóide Anterior",
    description: "Máquina de isolamento do peitoral com arco controlado.",
    instructions: "1. Ajustar assento, braços ao nível do peito\n2. Juntar os braços à frente\n3. Contrair o peito na posição fechada\n4. Voltar controladamente" },

  { name: "Máquina de Abdutores", muscleGroup: "legs", equipment: "Máquina", difficulty: "beginner", secondaryMuscles: "Glúteo médio",
    description: "Fortalecimento dos abdutores da anca e glúteo médio.",
    instructions: "1. Sentar na máquina, almofadas no exterior dos joelhos\n2. Abrir as pernas contra a resistência\n3. Contrair no final\n4. Voltar controladamente" },

  { name: "Máquina de Adutores", muscleGroup: "legs", equipment: "Máquina", difficulty: "beginner", secondaryMuscles: "",
    description: "Fortalecimento dos adutores (interior da coxa).",
    instructions: "1. Sentar na máquina, almofadas no interior dos joelhos\n2. Fechar as pernas contra a resistência\n3. Contrair no final\n4. Voltar controladamente" },

  { name: "Prensa de Ombros na Máquina", muscleGroup: "shoulders", equipment: "Máquina", difficulty: "beginner", secondaryMuscles: "Tríceps",
    description: "Press de ombros guiado na máquina. Seguro para iniciantes.",
    instructions: "1. Ajustar assento, pegas ao nível dos ombros\n2. Empurrar para cima até extensão\n3. Descer controladamente" },

  { name: "Remada na Máquina (Seated Row)", muscleGroup: "back", equipment: "Máquina", difficulty: "beginner", secondaryMuscles: "Bíceps",
    description: "Remada sentada na máquina para espessura das costas.",
    instructions: "1. Peito apoiado no suporte\n2. Puxar as pegas ao abdómen\n3. Contrair as omoplatas\n4. Voltar estendendo os braços" },

  { name: "Glute Kickback na Máquina", muscleGroup: "legs", equipment: "Máquina", difficulty: "beginner", secondaryMuscles: "Isquiotibiais",
    description: "Exercício de isolamento dos glúteos na máquina.",
    instructions: "1. De pé na máquina, uma perna na plataforma\n2. Empurrar a plataforma para trás\n3. Contrair o glúteo no topo\n4. Voltar controladamente" },

  { name: "Smith Machine Agachamento", muscleGroup: "legs", equipment: "Smith Machine", difficulty: "beginner", secondaryMuscles: "Glúteos, Core",
    description: "Agachamento guiado no Smith Machine. Boa opção para treinar sozinho.",
    instructions: "1. Barra nos trapézios, pés ligeiramente à frente\n2. Descer controladamente\n3. Subir empurrando os calcanhares\n4. Não bloquear joelhos no topo" },
];

async function seedExercises() {
  console.log("🏋️ A carregar base de dados de exercícios...\n");

  // Count existing
  const existingCount = await prisma.exercise.count();
  if (existingCount > 20) {
    console.log(`⚠️  Já existem ${existingCount} exercícios. A saltar seed de exercícios.`);
    console.log("   Para forçar, apaga os exercícios existentes ou usa --force\n");
    
    if (!process.argv.includes("--force")) {
      await prisma.$disconnect();
      return;
    }
    console.log("   --force detectado. A continuar...\n");
  }

  let created = 0;
  let skipped = 0;

  for (const ex of exerciseList) {
    // Check if exercise already exists by name
    const existing = await prisma.exercise.findFirst({
      where: { name: ex.name },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.exercise.create({
      data: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        description: ex.description,
        instructions: ex.instructions,
        videoUrl: ex.videoUrl || null,
        thumbnailUrl: ex.thumbnailUrl || null,
      },
    });
    created++;
  }

  console.log(`✅ ${created} exercícios criados`);
  if (skipped > 0) console.log(`⏭️  ${skipped} exercícios já existiam (ignorados)`);
  console.log(`📊 Total na base de dados: ${await prisma.exercise.count()}\n`);

  // Print summary by muscle group
  const groups = await prisma.exercise.groupBy({
    by: ["muscleGroup"],
    _count: true,
    orderBy: { _count: { muscleGroup: "desc" } },
  });

  console.log("📋 Exercícios por grupo muscular:");
  for (const g of groups) {
    const label = {
      chest: "Peito", back: "Costas", legs: "Pernas", shoulders: "Ombros",
      arms: "Braços", core: "Core", cardio: "Cardio", full_body: "Corpo Inteiro",
    }[g.muscleGroup] || g.muscleGroup;
    console.log(`   ${label}: ${g._count}`);
  }

  await prisma.$disconnect();
  console.log("\n🎉 Seed de exercícios concluído!");
}

seedExercises()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  });
