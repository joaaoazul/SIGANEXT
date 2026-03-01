import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

// ============================================================
// BASE DE DADOS COMPREENSIVA DE ALIMENTOS PORTUGUESES
// Valores nutricionais por 100g (fonte: Tabela INSA Portugal)
// Inclui produtos comuns de supermercados PT (Continente, Pingo Doce, etc.)
// ============================================================

interface FoodSeed {
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  isSupplement: boolean;
  brand: string | null;
  servingSize: number | null;
  servingUnit: string | null;
}

const foodList: FoodSeed[] = [
  // ==================== PROTEÍNAS - CARNES ====================
  { name: "Peito de Frango (grelhado)", category: "protein", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Peito de Frango (cru)", category: "protein", calories: 120, protein: 22.5, carbs: 0, fat: 2.6, fiber: 0, sugar: 0, sodium: 63, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Coxa de Frango (sem pele)", category: "protein", calories: 177, protein: 24.2, carbs: 0, fat: 8.6, fiber: 0, sugar: 0, sodium: 84, isSupplement: false, brand: null, servingSize: 120, servingUnit: "g" },
  { name: "Peito de Peru (grelhado)", category: "protein", calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 50, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Fiambre de Peru", category: "protein", calories: 104, protein: 17.5, carbs: 1.5, fat: 3, fiber: 0, sugar: 0.8, sodium: 850, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Bife de Novilho (grelhado)", category: "protein", calories: 217, protein: 26, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 56, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Carne de Vaca Picada (5% gordura)", category: "protein", calories: 137, protein: 21, carbs: 0, fat: 5, fiber: 0, sugar: 0, sodium: 66, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Carne de Vaca Picada (15% gordura)", category: "protein", calories: 215, protein: 18.6, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 66, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Bife de Porco (grelhado)", category: "protein", calories: 187, protein: 27, carbs: 0, fat: 8, fiber: 0, sugar: 0, sodium: 53, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Lombo de Porco (assado)", category: "protein", calories: 197, protein: 27.3, carbs: 0, fat: 9.3, fiber: 0, sugar: 0, sodium: 48, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Costeleta de Porco", category: "protein", calories: 231, protein: 25.7, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 55, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Coelho (assado)", category: "protein", calories: 197, protein: 29.1, carbs: 0, fat: 8.5, fiber: 0, sugar: 0, sodium: 47, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Pato (sem pele)", category: "protein", calories: 201, protein: 23.5, carbs: 0, fat: 11.2, fiber: 0, sugar: 0, sodium: 65, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Borrego (perna, grelhado)", category: "protein", calories: 258, protein: 25.5, carbs: 0, fat: 16.5, fiber: 0, sugar: 0, sodium: 72, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Vitela (bife, grelhado)", category: "protein", calories: 172, protein: 24, carbs: 0, fat: 8, fiber: 0, sugar: 0, sodium: 62, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },

  // ==================== PROTEÍNAS - PEIXE E MARISCO ====================
  { name: "Salmão (grelhado)", category: "protein", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Salmão (cru)", category: "protein", calories: 183, protein: 18.4, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 44, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Atum (lata, natural)", category: "protein", calories: 116, protein: 25.5, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 320, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Atum (lata, azeite)", category: "protein", calories: 198, protein: 23.6, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 380, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Atum Fresco (grelhado)", category: "protein", calories: 184, protein: 29.9, carbs: 0, fat: 6.3, fiber: 0, sugar: 0, sodium: 43, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Bacalhau (cozido)", category: "protein", calories: 105, protein: 23, carbs: 0, fat: 0.9, fiber: 0, sugar: 0, sodium: 75, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Bacalhau (seco, salgado)", category: "protein", calories: 136, protein: 29, carbs: 0, fat: 1.3, fiber: 0, sugar: 0, sodium: 7600, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Sardinha (grelhada)", category: "protein", calories: 208, protein: 24.6, carbs: 0, fat: 11.5, fiber: 0, sugar: 0, sodium: 68, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Sardinha (lata, azeite)", category: "protein", calories: 220, protein: 24.6, carbs: 0, fat: 13.9, fiber: 0, sugar: 0, sodium: 505, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Pescada (cozida)", category: "protein", calories: 86, protein: 18.3, carbs: 0, fat: 1.3, fiber: 0, sugar: 0, sodium: 110, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Robalo (grelhado)", category: "protein", calories: 124, protein: 23.6, carbs: 0, fat: 2.6, fiber: 0, sugar: 0, sodium: 68, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Dourada (grelhada)", category: "protein", calories: 135, protein: 23, carbs: 0, fat: 4.5, fiber: 0, sugar: 0, sodium: 52, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Linguado (grelhado)", category: "protein", calories: 91, protein: 19, carbs: 0, fat: 1.2, fiber: 0, sugar: 0, sodium: 81, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Camarão (cozido)", category: "protein", calories: 99, protein: 20.9, carbs: 0.2, fat: 1.7, fiber: 0, sugar: 0, sodium: 111, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Polvo (cozido)", category: "protein", calories: 82, protein: 14.9, carbs: 2.2, fat: 1.0, fiber: 0, sugar: 0, sodium: 230, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Lulas (grelhadas)", category: "protein", calories: 92, protein: 15.6, carbs: 3.1, fat: 1.4, fiber: 0, sugar: 0, sodium: 44, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Mexilhão (cozido)", category: "protein", calories: 86, protein: 11.9, carbs: 3.7, fat: 2.2, fiber: 0, sugar: 0, sodium: 286, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Amêijoa (cozida)", category: "protein", calories: 78, protein: 13.5, carbs: 2.6, fat: 1.0, fiber: 0, sugar: 0, sodium: 601, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Truta (grelhada)", category: "protein", calories: 150, protein: 26.6, carbs: 0, fat: 4.3, fiber: 0, sugar: 0, sodium: 61, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },

  // ==================== PROTEÍNAS - OVOS ====================
  { name: "Ovo Inteiro (cozido)", category: "protein", calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0, sugar: 1.1, sodium: 124, isSupplement: false, brand: null, servingSize: 60, servingUnit: "g" },
  { name: "Clara de Ovo", category: "protein", calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, sodium: 166, isSupplement: false, brand: null, servingSize: 33, servingUnit: "g" },
  { name: "Gema de Ovo", category: "protein", calories: 322, protein: 16, carbs: 3.6, fat: 26.5, fiber: 0, sugar: 0.6, sodium: 48, isSupplement: false, brand: null, servingSize: 17, servingUnit: "g" },
  { name: "Ovo Estrelado", category: "protein", calories: 196, protein: 13.6, carbs: 0.8, fat: 15, fiber: 0, sugar: 0.4, sodium: 207, isSupplement: false, brand: null, servingSize: 60, servingUnit: "g" },

  // ==================== HIDRATOS DE CARBONO - CEREAIS E GRÃOS ====================
  { name: "Arroz Branco (cozido)", category: "carbs", calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4, sugar: 0, sodium: 1, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Arroz Integral (cozido)", category: "carbs", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Arroz Basmati (cozido)", category: "carbs", calories: 121, protein: 3.5, carbs: 25.2, fat: 0.4, fiber: 0.4, sugar: 0.1, sodium: 1, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Massa (cozida)", category: "carbs", calories: 131, protein: 5.1, carbs: 25.4, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 1, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Massa Integral (cozida)", category: "carbs", calories: 124, protein: 5.3, carbs: 24.9, fat: 0.5, fiber: 3.9, sugar: 0.6, sodium: 3, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Esparguete (cozido)", category: "carbs", calories: 131, protein: 5, carbs: 25.4, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 1, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Quinoa (cozida)", category: "carbs", calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Cuscuz (cozido)", category: "carbs", calories: 112, protein: 3.8, carbs: 23.2, fat: 0.2, fiber: 1.4, sugar: 0.1, sodium: 5, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Bulgur (cozido)", category: "carbs", calories: 83, protein: 3.1, carbs: 18.6, fat: 0.2, fiber: 4.5, sugar: 0.1, sodium: 5, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Aveia em Flocos", category: "carbs", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0, sodium: 2, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Pão de Forma Integral", category: "carbs", calories: 247, protein: 13, carbs: 41.3, fat: 3.4, fiber: 7, sugar: 5.6, sodium: 450, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Pão de Forma Branco", category: "carbs", calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 500, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Pão de Mistura", category: "carbs", calories: 258, protein: 8.8, carbs: 50, fat: 2.4, fiber: 4.3, sugar: 2.8, sodium: 540, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Pão de Centeio", category: "carbs", calories: 259, protein: 8.5, carbs: 48, fat: 3.3, fiber: 5.8, sugar: 3.9, sodium: 603, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Pão Alentejano", category: "carbs", calories: 268, protein: 8.2, carbs: 52, fat: 1.8, fiber: 2.1, sugar: 1.5, sodium: 480, isSupplement: false, brand: null, servingSize: 70, servingUnit: "g" },
  { name: "Broa de Milho", category: "carbs", calories: 225, protein: 4.8, carbs: 47, fat: 1.6, fiber: 2.3, sugar: 1.2, sodium: 380, isSupplement: false, brand: null, servingSize: 60, servingUnit: "g" },
  { name: "Tostas (integrais)", category: "carbs", calories: 373, protein: 11, carbs: 70, fat: 5.5, fiber: 6.5, sugar: 4, sodium: 620, isSupplement: false, brand: null, servingSize: 10, servingUnit: "g" },
  { name: "Tortilha de Trigo", category: "carbs", calories: 312, protein: 8.3, carbs: 51.6, fat: 8.1, fiber: 2.2, sugar: 3.7, sodium: 541, isSupplement: false, brand: null, servingSize: 60, servingUnit: "g" },
  { name: "Bolachas de Arroz", category: "carbs", calories: 387, protein: 8.4, carbs: 81.5, fat: 3.4, fiber: 3.5, sugar: 0.3, sodium: 28, isSupplement: false, brand: null, servingSize: 10, servingUnit: "g" },
  { name: "Cereais Muesli (sem açúcar)", category: "carbs", calories: 340, protein: 9, carbs: 62, fat: 6.5, fiber: 8, sugar: 13, sodium: 40, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Granola (caseira)", category: "carbs", calories: 420, protein: 10, carbs: 55, fat: 18, fiber: 6, sugar: 15, sodium: 20, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },

  // ==================== HIDRATOS DE CARBONO - TUBÉRCULOS ====================
  { name: "Batata (cozida)", category: "carbs", calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6, isSupplement: false, brand: null, servingSize: 200, servingUnit: "g" },
  { name: "Batata Doce (cozida)", category: "carbs", calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 36, isSupplement: false, brand: null, servingSize: 200, servingUnit: "g" },
  { name: "Batata (assada)", category: "carbs", calories: 93, protein: 2.5, carbs: 21.2, fat: 0.1, fiber: 2.2, sugar: 1.4, sodium: 10, isSupplement: false, brand: null, servingSize: 200, servingUnit: "g" },
  { name: "Inhame (cozido)", category: "carbs", calories: 118, protein: 1.5, carbs: 27.9, fat: 0.2, fiber: 3.9, sugar: 0.5, sodium: 9, isSupplement: false, brand: null, servingSize: 200, servingUnit: "g" },
  { name: "Mandioca (cozida)", category: "carbs", calories: 160, protein: 1.4, carbs: 38, fat: 0.3, fiber: 1.8, sugar: 1.7, sodium: 14, isSupplement: false, brand: null, servingSize: 200, servingUnit: "g" },

  // ==================== HIDRATOS DE CARBONO - LEGUMINOSAS ====================
  { name: "Feijão Preto (cozido)", category: "carbs", calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7, sugar: 0.3, sodium: 1, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Feijão Vermelho (cozido)", category: "carbs", calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4, sugar: 0.3, sodium: 2, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Feijão Branco (cozido)", category: "carbs", calories: 139, protein: 9.7, carbs: 25.1, fat: 0.4, fiber: 6.3, sugar: 0.3, sodium: 6, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Grão-de-bico (cozido)", category: "carbs", calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6, sugar: 4.8, sodium: 7, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Lentilhas (cozidas)", category: "carbs", calories: 116, protein: 9, carbs: 20.1, fat: 0.4, fiber: 7.9, sugar: 1.8, sodium: 2, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Ervilhas (cozidas)", category: "carbs", calories: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1, sugar: 5.7, sodium: 5, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Favas (cozidas)", category: "carbs", calories: 88, protein: 7.6, carbs: 12.4, fat: 0.4, fiber: 5.4, sugar: 1.8, sodium: 5, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Soja (grãos, cozida)", category: "carbs", calories: 141, protein: 12.4, carbs: 11.1, fat: 6.4, fiber: 4.2, sugar: 3, sodium: 1, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Edamame (cozido)", category: "carbs", calories: 122, protein: 11.9, carbs: 8.6, fat: 5.2, fiber: 5.2, sugar: 2.2, sodium: 6, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },

  // ==================== GORDURAS SAUDÁVEIS ====================
  { name: "Azeite Extra Virgem", category: "fats", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 2, isSupplement: false, brand: null, servingSize: 15, servingUnit: "ml" },
  { name: "Óleo de Coco", category: "fats", calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0, isSupplement: false, brand: null, servingSize: 15, servingUnit: "ml" },
  { name: "Manteiga de Amendoim (natural)", category: "fats", calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, sodium: 17, isSupplement: false, brand: null, servingSize: 20, servingUnit: "g" },
  { name: "Manteiga de Amêndoa", category: "fats", calories: 614, protein: 21, carbs: 18.8, fat: 55.5, fiber: 10.5, sugar: 6.3, sodium: 2, isSupplement: false, brand: null, servingSize: 20, servingUnit: "g" },
  { name: "Abacate", category: "fats", calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7, sodium: 7, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Amêndoas (naturais)", category: "fats", calories: 579, protein: 21.2, carbs: 21.7, fat: 49.9, fiber: 12.5, sugar: 4.4, sodium: 1, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Nozes", category: "fats", calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7, sugar: 2.6, sodium: 2, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Cajus", category: "fats", calories: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fiber: 3.3, sugar: 5.9, sodium: 12, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Sementes de Chia", category: "fats", calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4, sugar: 0, sodium: 16, isSupplement: false, brand: null, servingSize: 15, servingUnit: "g" },
  { name: "Sementes de Linhaça", category: "fats", calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3, sugar: 1.6, sodium: 30, isSupplement: false, brand: null, servingSize: 15, servingUnit: "g" },
  { name: "Sementes de Girassol", category: "fats", calories: 584, protein: 20.8, carbs: 20, fat: 51.5, fiber: 8.6, sugar: 2.6, sodium: 9, isSupplement: false, brand: null, servingSize: 20, servingUnit: "g" },
  { name: "Sementes de Abóbora", category: "fats", calories: 559, protein: 30.2, carbs: 10.7, fat: 49.1, fiber: 6, sugar: 1.4, sodium: 7, isSupplement: false, brand: null, servingSize: 20, servingUnit: "g" },
  { name: "Azeitonas (pretas)", category: "fats", calories: 115, protein: 0.8, carbs: 6.3, fat: 10.7, fiber: 3.2, sugar: 0, sodium: 735, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Azeitonas (verdes)", category: "fats", calories: 145, protein: 1, carbs: 3.8, fat: 15.3, fiber: 3.3, sugar: 0.5, sodium: 1556, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Manteiga", category: "fats", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1, sodium: 11, isSupplement: false, brand: null, servingSize: 10, servingUnit: "g" },
  { name: "Creme de Leite", category: "fats", calories: 340, protein: 2.1, carbs: 2.8, fat: 36, fiber: 0, sugar: 2.8, sodium: 34, isSupplement: false, brand: null, servingSize: 30, servingUnit: "ml" },

  // ==================== VEGETAIS ====================
  { name: "Brócolos (cozidos)", category: "vegetables", calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3, sugar: 1.4, sodium: 41, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Brócolos (crus)", category: "vegetables", calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Espinafre (cru)", category: "vegetables", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Espinafre (cozido)", category: "vegetables", calories: 23, protein: 3, carbs: 3.8, fat: 0.3, fiber: 2.4, sugar: 0.5, sodium: 70, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Couve-flor", category: "vegetables", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, sugar: 1.9, sodium: 30, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Couve Portuguesa (cozida)", category: "vegetables", calories: 33, protein: 2.5, carbs: 5.6, fat: 0.4, fiber: 3.6, sugar: 1.3, sodium: 23, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Couve Kale", category: "vegetables", calories: 35, protein: 2.9, carbs: 4.4, fat: 1.5, fiber: 4.1, sugar: 0.8, sodium: 53, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Alface", category: "vegetables", calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, sodium: 28, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Rúcula", category: "vegetables", calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6, sugar: 2, sodium: 27, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Tomate", category: "vegetables", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Pepino", category: "vegetables", calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Cenoura (crua)", category: "vegetables", calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Cenoura (cozida)", category: "vegetables", calories: 35, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 3, sugar: 3.5, sodium: 58, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Cebola", category: "vegetables", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Alho (dente)", category: "vegetables", calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1, sugar: 1, sodium: 17, isSupplement: false, brand: null, servingSize: 5, servingUnit: "g" },
  { name: "Pimento Vermelho", category: "vegetables", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2, sodium: 4, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Pimento Verde", category: "vegetables", calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7, sugar: 2.4, sodium: 3, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Beringela (cozida)", category: "vegetables", calories: 35, protein: 0.8, carbs: 8.7, fat: 0.2, fiber: 2.5, sugar: 3.2, sodium: 1, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Curgete (courgette)", category: "vegetables", calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5, sodium: 8, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Feijão Verde (cozido)", category: "vegetables", calories: 35, protein: 1.8, carbs: 7.9, fat: 0.1, fiber: 3.4, sugar: 1.4, sodium: 1, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Espargos (cozidos)", category: "vegetables", calories: 22, protein: 2.4, carbs: 4.1, fat: 0.2, fiber: 2, sugar: 1.3, sodium: 14, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Cogumelos (crus)", category: "vegetables", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, sugar: 2, sodium: 5, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Abóbora (cozida)", category: "vegetables", calories: 26, protein: 1, carbs: 6.5, fat: 0.1, fiber: 0.5, sugar: 2.8, sodium: 1, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Nabo (cozido)", category: "vegetables", calories: 22, protein: 0.7, carbs: 5.1, fat: 0.1, fiber: 2, sugar: 3, sodium: 16, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Grelos de Nabo (cozidos)", category: "vegetables", calories: 20, protein: 1.1, carbs: 4.4, fat: 0.3, fiber: 3.5, sugar: 0.5, sodium: 29, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Milho Doce (lata)", category: "vegetables", calories: 82, protein: 2.8, carbs: 17, fat: 1.2, fiber: 2, sugar: 4.5, sodium: 295, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },

  // ==================== FRUTAS ====================
  { name: "Banana", category: "fruits", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1, isSupplement: false, brand: null, servingSize: 120, servingUnit: "g" },
  { name: "Maçã", category: "fruits", calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4, sodium: 1, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Laranja", category: "fruits", calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4, sodium: 0, isSupplement: false, brand: null, servingSize: 200, servingUnit: "g" },
  { name: "Morango", category: "fruits", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9, sodium: 1, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Mirtilo (blueberry)", category: "fruits", calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10, sodium: 1, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Framboesa", category: "fruits", calories: 52, protein: 1.2, carbs: 11.9, fat: 0.7, fiber: 6.5, sugar: 4.4, sodium: 1, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Uva", category: "fruits", calories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9, sugar: 15.5, sodium: 2, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Pêra", category: "fruits", calories: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1, sugar: 9.8, sodium: 1, isSupplement: false, brand: null, servingSize: 180, servingUnit: "g" },
  { name: "Pêssego", category: "fruits", calories: 39, protein: 0.9, carbs: 9.5, fat: 0.3, fiber: 1.5, sugar: 8.4, sodium: 0, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Manga", category: "fruits", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7, sodium: 1, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Ananás (abacaxi)", category: "fruits", calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, sugar: 9.9, sodium: 1, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Kiwi", category: "fruits", calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3, sugar: 9, sodium: 3, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Melão", category: "fruits", calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 0.9, sugar: 7.9, sodium: 16, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Melancia", category: "fruits", calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2, sodium: 1, isSupplement: false, brand: null, servingSize: 200, servingUnit: "g" },
  { name: "Cereja", category: "fruits", calories: 63, protein: 1.1, carbs: 16, fat: 0.2, fiber: 2.1, sugar: 12.8, sodium: 0, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Ameixa", category: "fruits", calories: 46, protein: 0.7, carbs: 11.4, fat: 0.3, fiber: 1.4, sugar: 9.9, sodium: 0, isSupplement: false, brand: null, servingSize: 80, servingUnit: "g" },
  { name: "Figo (fresco)", category: "fruits", calories: 74, protein: 0.8, carbs: 19.2, fat: 0.3, fiber: 2.9, sugar: 16.3, sodium: 1, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Tâmaras (secas)", category: "fruits", calories: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7, sugar: 66.5, sodium: 1, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Frutos Vermelhos (mix)", category: "fruits", calories: 48, protein: 0.8, carbs: 11, fat: 0.4, fiber: 3.5, sugar: 7, sodium: 1, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },

  // ==================== LATICÍNIOS ====================
  { name: "Leite Meio-Gordo", category: "dairy", calories: 47, protein: 3.3, carbs: 4.7, fat: 1.6, fiber: 0, sugar: 4.7, sodium: 44, isSupplement: false, brand: null, servingSize: 250, servingUnit: "ml" },
  { name: "Leite Magro", category: "dairy", calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, sugar: 5, sodium: 52, isSupplement: false, brand: null, servingSize: 250, servingUnit: "ml" },
  { name: "Leite Gordo", category: "dairy", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 4.8, sodium: 43, isSupplement: false, brand: null, servingSize: 250, servingUnit: "ml" },
  { name: "Iogurte Natural (magro)", category: "dairy", calories: 56, protein: 5.7, carbs: 7.8, fat: 0.2, fiber: 0, sugar: 7.8, sodium: 77, isSupplement: false, brand: null, servingSize: 125, servingUnit: "g" },
  { name: "Iogurte Grego Natural", category: "dairy", calories: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0, sugar: 3.6, sodium: 36, isSupplement: false, brand: null, servingSize: 125, servingUnit: "g" },
  { name: "Iogurte Grego (0% gordura)", category: "dairy", calories: 59, protein: 10.2, carbs: 3.6, fat: 0.7, fiber: 0, sugar: 3.6, sodium: 36, isSupplement: false, brand: null, servingSize: 125, servingUnit: "g" },
  { name: "Iogurte Skyr Natural", category: "dairy", calories: 63, protein: 11, carbs: 4, fat: 0.2, fiber: 0, sugar: 3.5, sodium: 40, isSupplement: false, brand: null, servingSize: 150, servingUnit: "g" },
  { name: "Queijo Fresco", category: "dairy", calories: 194, protein: 11.5, carbs: 2.5, fat: 15.5, fiber: 0, sugar: 2.5, sodium: 360, isSupplement: false, brand: null, servingSize: 60, servingUnit: "g" },
  { name: "Queijo Flamengo (fatias)", category: "dairy", calories: 340, protein: 24, carbs: 1, fat: 27, fiber: 0, sugar: 0.5, sodium: 1130, isSupplement: false, brand: null, servingSize: 20, servingUnit: "g" },
  { name: "Queijo Cottage", category: "dairy", calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, sodium: 364, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Queijo Quark", category: "dairy", calories: 67, protein: 12, carbs: 4, fat: 0.3, fiber: 0, sugar: 4, sodium: 35, isSupplement: false, brand: null, servingSize: 100, servingUnit: "g" },
  { name: "Queijo Mozzarella", category: "dairy", calories: 280, protein: 28, carbs: 3.1, fat: 17.1, fiber: 0, sugar: 1.2, sodium: 627, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Queijo Parmesão", category: "dairy", calories: 392, protein: 35.8, carbs: 3.2, fat: 25.8, fiber: 0, sugar: 0.8, sodium: 1602, isSupplement: false, brand: null, servingSize: 10, servingUnit: "g" },
  { name: "Requeijão", category: "dairy", calories: 187, protein: 7.5, carbs: 4, fat: 15.8, fiber: 0, sugar: 4, sodium: 280, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Bebida de Amêndoa (sem açúcar)", category: "dairy", calories: 13, protein: 0.4, carbs: 0.3, fat: 1.1, fiber: 0.2, sugar: 0, sodium: 70, isSupplement: false, brand: null, servingSize: 250, servingUnit: "ml" },
  { name: "Bebida de Aveia", category: "dairy", calories: 46, protein: 1, carbs: 6.7, fat: 1.5, fiber: 0.8, sugar: 4, sodium: 42, isSupplement: false, brand: null, servingSize: 250, servingUnit: "ml" },
  { name: "Bebida de Soja", category: "dairy", calories: 42, protein: 3.5, carbs: 2.8, fat: 1.8, fiber: 0.2, sugar: 2.5, sodium: 32, isSupplement: false, brand: null, servingSize: 250, servingUnit: "ml" },

  // ==================== SUPLEMENTOS ====================
  { name: "Whey Protein (Isolado)", category: "supplements", calories: 370, protein: 90, carbs: 1, fat: 0.5, fiber: 0, sugar: 0.5, sodium: 200, isSupplement: true, brand: "Genérico", servingSize: 30, servingUnit: "g" },
  { name: "Whey Protein (Concentrado)", category: "supplements", calories: 400, protein: 80, carbs: 8, fat: 5, fiber: 0, sugar: 4, sodium: 180, isSupplement: true, brand: "Genérico", servingSize: 30, servingUnit: "g" },
  { name: "Caseína Micelar", category: "supplements", calories: 360, protein: 85, carbs: 3, fat: 1, fiber: 0, sugar: 2, sodium: 150, isSupplement: true, brand: "Genérico", servingSize: 30, servingUnit: "g" },
  { name: "Proteína Vegan (Ervilha + Arroz)", category: "supplements", calories: 380, protein: 75, carbs: 8, fat: 5, fiber: 3, sugar: 1, sodium: 350, isSupplement: true, brand: "Genérico", servingSize: 30, servingUnit: "g" },
  { name: "BCAA (pó)", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 10, servingUnit: "g" },
  { name: "Creatina Monohidratada", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 5, servingUnit: "g" },
  { name: "Maltodextrina", category: "supplements", calories: 380, protein: 0, carbs: 95, fat: 0, fiber: 0, sugar: 10, sodium: 30, isSupplement: true, brand: "Genérico", servingSize: 30, servingUnit: "g" },
  { name: "Dextrose", category: "supplements", calories: 400, protein: 0, carbs: 100, fat: 0, fiber: 0, sugar: 100, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 30, servingUnit: "g" },
  { name: "Aveia em Pó (instant oats)", category: "supplements", calories: 370, protein: 12, carbs: 65, fat: 6, fiber: 8, sugar: 1, sodium: 5, isSupplement: true, brand: "Genérico", servingSize: 50, servingUnit: "g" },
  { name: "Glutamina", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 5, servingUnit: "g" },
  { name: "Óleo de Peixe (Ómega 3)", category: "supplements", calories: 9, protein: 0, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 1, servingUnit: "unit" },
  { name: "Multivitamínico", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 1, servingUnit: "unit" },
  { name: "Vitamina D3 (4000 UI)", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 1, servingUnit: "unit" },
  { name: "Magnésio (bisglicinato)", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 1, servingUnit: "unit" },
  { name: "ZMA", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 3, servingUnit: "unit" },
  { name: "Cafeína (cápsula, 200mg)", category: "supplements", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, isSupplement: true, brand: "Genérico", servingSize: 1, servingUnit: "unit" },
  { name: "Barra Proteica", category: "supplements", calories: 350, protein: 30, carbs: 35, fat: 12, fiber: 5, sugar: 8, sodium: 200, isSupplement: true, brand: "Genérico", servingSize: 60, servingUnit: "g" },

  // ==================== OUTROS / CONDIMENTOS / BEBIDAS ====================
  { name: "Mel", category: "other", calories: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2, sugar: 82.1, sodium: 4, isSupplement: false, brand: null, servingSize: 15, servingUnit: "g" },
  { name: "Açúcar (branco)", category: "other", calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, sugar: 100, sodium: 0, isSupplement: false, brand: null, servingSize: 5, servingUnit: "g" },
  { name: "Compota (sem açúcar)", category: "other", calories: 130, protein: 0.4, carbs: 31, fat: 0.1, fiber: 1, sugar: 25, sodium: 10, isSupplement: false, brand: null, servingSize: 20, servingUnit: "g" },
  { name: "Chocolate Negro (85%)", category: "other", calories: 580, protein: 10, carbs: 26, fat: 46, fiber: 12, sugar: 14, sodium: 20, isSupplement: false, brand: null, servingSize: 20, servingUnit: "g" },
  { name: "Chocolate de Leite", category: "other", calories: 535, protein: 5.5, carbs: 60, fat: 30, fiber: 2, sugar: 54, sodium: 79, isSupplement: false, brand: null, servingSize: 20, servingUnit: "g" },
  { name: "Cacau em Pó (sem açúcar)", category: "other", calories: 228, protein: 19.6, carbs: 57.9, fat: 13.7, fiber: 33.2, sugar: 1.8, sodium: 21, isSupplement: false, brand: null, servingSize: 10, servingUnit: "g" },
  { name: "Café (sem açúcar)", category: "other", calories: 2, protein: 0.1, carbs: 0.3, fat: 0, fiber: 0, sugar: 0, sodium: 2, isSupplement: false, brand: null, servingSize: 30, servingUnit: "ml" },
  { name: "Chá Verde", category: "other", calories: 1, protein: 0, carbs: 0.2, fat: 0, fiber: 0, sugar: 0, sodium: 1, isSupplement: false, brand: null, servingSize: 250, servingUnit: "ml" },
  { name: "Vinagre Balsâmico", category: "other", calories: 88, protein: 0.5, carbs: 17, fat: 0, fiber: 0, sugar: 14.9, sodium: 23, isSupplement: false, brand: null, servingSize: 15, servingUnit: "ml" },
  { name: "Molho de Soja", category: "other", calories: 53, protein: 4.9, carbs: 4.9, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 5493, isSupplement: false, brand: null, servingSize: 15, servingUnit: "ml" },
  { name: "Mostarda", category: "other", calories: 66, protein: 4.4, carbs: 5.3, fat: 3.3, fiber: 3.3, sugar: 2.6, sodium: 1135, isSupplement: false, brand: null, servingSize: 10, servingUnit: "g" },
  { name: "Ketchup", category: "other", calories: 112, protein: 1.7, carbs: 27.4, fat: 0.1, fiber: 0.3, sugar: 22.8, sodium: 907, isSupplement: false, brand: null, servingSize: 15, servingUnit: "g" },
  { name: "Maionese (light)", category: "other", calories: 231, protein: 0.5, carbs: 10.2, fat: 21, fiber: 0, sugar: 4.8, sodium: 730, isSupplement: false, brand: null, servingSize: 15, servingUnit: "g" },
  { name: "Hummus", category: "other", calories: 166, protein: 7.9, carbs: 14.3, fat: 9.6, fiber: 6, sugar: 0.3, sodium: 379, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },
  { name: "Guacamole", category: "other", calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7, sodium: 376, isSupplement: false, brand: null, servingSize: 50, servingUnit: "g" },
  { name: "Pasta de Atum", category: "other", calories: 164, protein: 12, carbs: 4.2, fat: 11.2, fiber: 0, sugar: 0.5, sodium: 480, isSupplement: false, brand: null, servingSize: 30, servingUnit: "g" },

  // ==================== SUPERMARKET BRANDS (PT) ====================
  { name: "Peito de Frango Fatiado", category: "protein", calories: 110, protein: 22, carbs: 1, fat: 2, fiber: 0, sugar: 0.5, sodium: 800, isSupplement: false, brand: "Continente", servingSize: 30, servingUnit: "g" },
  { name: "Fiambre da Perna Extra", category: "protein", calories: 114, protein: 18, carbs: 1.8, fat: 3.5, fiber: 0, sugar: 1, sodium: 880, isSupplement: false, brand: "Pingo Doce", servingSize: 30, servingUnit: "g" },
  { name: "Iogurte Proteico Natural", category: "dairy", calories: 65, protein: 10, carbs: 4, fat: 0.5, fiber: 0, sugar: 3.5, sodium: 45, isSupplement: false, brand: "Lidl / Milbona", servingSize: 200, servingUnit: "g" },
  { name: "Iogurte Proteico Morango", category: "dairy", calories: 72, protein: 10, carbs: 6, fat: 0.5, fiber: 0, sugar: 5, sodium: 45, isSupplement: false, brand: "Lidl / Milbona", servingSize: 200, servingUnit: "g" },
  { name: "Pão de Proteína", category: "carbs", calories: 248, protein: 24, carbs: 18, fat: 8, fiber: 10, sugar: 3, sodium: 480, isSupplement: false, brand: "Continente Equilíbrio", servingSize: 40, servingUnit: "g" },
  { name: "Tortilha de Trigo Integral", category: "carbs", calories: 280, protein: 8, carbs: 44, fat: 6, fiber: 5, sodium: 560, sugar: 2, isSupplement: false, brand: "Pingo Doce", servingSize: 60, servingUnit: "g" },
  { name: "Leite Proteico Chocolate", category: "dairy", calories: 60, protein: 8, carbs: 5, fat: 0.5, fiber: 0, sugar: 4.5, sodium: 60, isSupplement: false, brand: "Mimosa PRO", servingSize: 250, servingUnit: "ml" },
  { name: "Atum Posta em Azeite", category: "protein", calories: 196, protein: 24, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 400, isSupplement: false, brand: "Bom Petisco", servingSize: 80, servingUnit: "g" },
  { name: "Sardinhas em Azeite", category: "protein", calories: 220, protein: 21, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 520, isSupplement: false, brand: "Ramirez", servingSize: 80, servingUnit: "g" },
  { name: "Cream Cheese Light", category: "dairy", calories: 125, protein: 6, carbs: 5, fat: 9.5, fiber: 0, sugar: 5, sodium: 510, isSupplement: false, brand: "Philadelphia", servingSize: 30, servingUnit: "g" },
  { name: "Manteiga de Amendoim 100%", category: "fats", calories: 625, protein: 25, carbs: 12, fat: 53, fiber: 8, sugar: 4, sodium: 5, isSupplement: false, brand: "Prozis", servingSize: 20, servingUnit: "g" },
  { name: "Pasta de Amêndoa", category: "fats", calories: 614, protein: 21, carbs: 19, fat: 55, fiber: 10, sugar: 4, sodium: 3, isSupplement: false, brand: "Prozis", servingSize: 20, servingUnit: "g" },
  { name: "Whey Protein Isolate", category: "supplements", calories: 375, protein: 91, carbs: 0.5, fat: 0.3, fiber: 0, sugar: 0.5, sodium: 190, isSupplement: true, brand: "Prozis", servingSize: 30, servingUnit: "g" },
  { name: "Whey Protein Concentrate", category: "supplements", calories: 395, protein: 78, carbs: 9, fat: 5, fiber: 0, sugar: 5, sodium: 170, isSupplement: true, brand: "MyProtein", servingSize: 30, servingUnit: "g" },
  { name: "Granola Proteica", category: "carbs", calories: 410, protein: 18, carbs: 45, fat: 16, fiber: 8, sugar: 12, sodium: 50, isSupplement: false, brand: "Prozis", servingSize: 50, servingUnit: "g" },
  { name: "Panquecas de Proteína (mix)", category: "carbs", calories: 352, protein: 35, carbs: 40, fat: 5, fiber: 3, sugar: 5, sodium: 350, isSupplement: false, brand: "Prozis", servingSize: 40, servingUnit: "g" },
  { name: "Creme de Arroz (pó)", category: "carbs", calories: 370, protein: 7, carbs: 83, fat: 0.5, fiber: 1, sugar: 0.5, sodium: 5, isSupplement: false, brand: "Prozis", servingSize: 50, servingUnit: "g" },

  // ==================== PRATOS PORTUGUESES COMUNS ====================
  { name: "Caldo Verde (prato)", category: "other", calories: 80, protein: 2.5, carbs: 10, fat: 3.5, fiber: 2, sugar: 0.8, sodium: 380, isSupplement: false, brand: null, servingSize: 250, servingUnit: "ml" },
  { name: "Sopa de Legumes", category: "other", calories: 45, protein: 1.5, carbs: 7, fat: 1.5, fiber: 2, sugar: 2, sodium: 320, isSupplement: false, brand: null, servingSize: 250, servingUnit: "ml" },
  { name: "Arroz de Tomate (prato)", category: "other", calories: 155, protein: 3.5, carbs: 30, fat: 2.5, fiber: 1.5, sugar: 3, sodium: 350, isSupplement: false, brand: null, servingSize: 200, servingUnit: "g" },
  { name: "Açorda (tradicional)", category: "other", calories: 170, protein: 7, carbs: 20, fat: 7, fiber: 1.5, sugar: 1, sodium: 550, isSupplement: false, brand: null, servingSize: 250, servingUnit: "g" },
];

async function seedFoods() {
  console.log("🥗 A carregar base de dados de alimentos...\n");

  const existingCount = await prisma.food.count();
  if (existingCount > 20) {
    console.log(`⚠️  Já existem ${existingCount} alimentos. A saltar seed de alimentos.`);
    console.log("   Para forçar, usa --force\n");
    
    if (!process.argv.includes("--force")) {
      await prisma.$disconnect();
      return;
    }
    console.log("   --force detectado. A continuar...\n");
  }

  let created = 0;
  let skipped = 0;

  for (const food of foodList) {
    const existing = await prisma.food.findFirst({
      where: { name: food.name },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.food.create({
      data: {
        name: food.name,
        category: food.category,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
        isSupplement: food.isSupplement,
        brand: food.brand,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
      },
    });
    created++;
  }

  console.log(`✅ ${created} alimentos criados`);
  if (skipped > 0) console.log(`⏭️  ${skipped} alimentos já existiam (ignorados)`);
  console.log(`📊 Total na base de dados: ${await prisma.food.count()}\n`);
  
  // Show breakdown by category
  const categories = await prisma.$queryRawUnsafe<{ category: string; count: bigint }[]>(
    `SELECT category, COUNT(*)::bigint as count FROM "Food" GROUP BY category ORDER BY count DESC`
  );
  console.log("📋 Alimentos por categoria:");
  for (const cat of categories) {
    console.log(`   ${cat.category}: ${cat.count}`);
  }

  await prisma.$disconnect();
}

seedFoods().catch((e) => {
  console.error("❌ Erro ao criar alimentos:", e);
  process.exit(1);
});
