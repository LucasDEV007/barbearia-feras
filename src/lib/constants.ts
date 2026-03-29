export const SERVICOS = [
  { nome: "Corte", preco: 35, descricao: "Corte masculino moderno" },
  { nome: "Barba", preco: 25, descricao: "Barba alinhada e hidratada" },
  { nome: "Sobrancelha", preco: 15, descricao: "Design de sobrancelha" },
  { nome: "Combo", preco: 50, descricao: "Corte + Barba completo" },
] as const;

export const HORARIOS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00",
] as const;

export const BARBEARIA_NOME = "Barbearia Feras";
export const BARBEARIA_WHATSAPP = "5585992946781"; // Número da barbearia
export const GOOGLE_REVIEW_LINK = "https://g.page/barbearia-feras/review"; // Link de avaliação Google
