export interface Servico {
  nome: string;
  preco: number;
  duracao: number; // minutos
  descricao: string;
  icone: string;
}

export const SERVICOS: Servico[] = [
  { nome: "Corte masculino", preco: 30, duracao: 30, descricao: "Corte masculino tradicional ou moderno, feito com atenção aos detalhes e acabamento profissional.", icone: "Scissors" },
  { nome: "Barba", preco: 15, duracao: 20, descricao: "Modelagem e alinhamento da barba com navalha e máquina para um visual mais limpo.", icone: "Scissors" },
  { nome: "Corte feminino", preco: 35, duracao: 30, descricao: "Corte feminino personalizado, respeitando o estilo e preferência da cliente.", icone: "Sparkles" },
  { nome: "Aplicação de tinta", preco: 30, duracao: 30, descricao: "Aplicação de coloração para renovar ou mudar o visual do cabelo.", icone: "Palette" },
  { nome: "Reflexo", preco: 70, duracao: 120, descricao: "Técnica de iluminação do cabelo que cria reflexos naturais e modernos.", icone: "Sparkles" },
  { nome: "Nevou / Platinado", preco: 100, duracao: 130, descricao: "Processo de descoloração para alcançar o efeito platinado ou nevado.", icone: "Snowflake" },
  { nome: "Pigmentação", preco: 15, duracao: 20, descricao: "Aplicação de pigmento para reforçar ou restaurar a cor do cabelo ou barba.", icone: "Droplet" },
  { nome: "Alisamento térmico", preco: 70, duracao: 100, descricao: "Procedimento para reduzir o volume e deixar o cabelo mais liso.", icone: "Flame" },
  { nome: "Sobrancelha unissex", preco: 10, duracao: 10, descricao: "Limpeza e modelagem da sobrancelha para melhorar o visual.", icone: "Eye" },
];

/** Horários de funcionamento por dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado) */
export interface HorarioFuncionamento {
  inicio1: string;
  fim1: string;
  inicio2?: string;
  fim2?: string;
}

export const HORARIOS_FUNCIONAMENTO: Record<number, HorarioFuncionamento> = {
  0: { inicio1: "09:00", fim1: "12:00" }, // Domingo
  1: { inicio1: "09:00", fim1: "12:00", inicio2: "14:00", fim2: "17:00" }, // Segunda
  2: { inicio1: "09:00", fim1: "12:00", inicio2: "14:00", fim2: "17:00" }, // Terça
  3: { inicio1: "09:00", fim1: "12:00", inicio2: "14:00", fim2: "17:00" }, // Quarta
  4: { inicio1: "09:00", fim1: "12:00", inicio2: "14:00", fim2: "17:00" }, // Quinta
  5: { inicio1: "09:00", fim1: "12:00", inicio2: "14:00", fim2: "20:00" }, // Sexta
  6: { inicio1: "09:00", fim1: "12:00", inicio2: "14:00", fim2: "20:00" }, // Sábado
};

/** Gera slots de 30 min para um dia da semana, considerando a duração do serviço */
export function gerarHorarios(diaSemana: number, duracaoServico: number = 30): string[] {
  const config = HORARIOS_FUNCIONAMENTO[diaSemana];
  if (!config) return [];

  const slots: string[] = [];

  const addSlots = (inicio: string, fim: string) => {
    const [hi, mi] = inicio.split(":").map(Number);
    const [hf, mf] = fim.split(":").map(Number);
    const inicioMin = hi * 60 + mi;
    const fimMin = hf * 60 + mf;

    for (let t = inicioMin; t + duracaoServico <= fimMin; t += 30) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  };

  addSlots(config.inicio1, config.fim1);
  if (config.inicio2 && config.fim2) {
    addSlots(config.inicio2, config.fim2);
  }

  return slots;
}

export const BARBEARIA_NOME = "Fera's Barbershop";
export const BARBEARIA_WHATSAPP = "5585985653388";
export const GOOGLE_REVIEW_LINK = "https://maps.app.goo.gl/2de33R82W4RfUdzG9";
