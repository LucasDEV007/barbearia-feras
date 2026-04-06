import { gerarHorarios } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlotGridProps {
  horariosOcupados: string[];
  horarioSelecionado: string | null;
  onSelect: (horario: string) => void;
  loading?: boolean;
  dataSelecionada?: Date;
  duracaoServico?: number;
}

const isHoje = (date?: Date) => {
  if (!date) return false;
  const hoje = new Date();
  return date.getFullYear() === hoje.getFullYear() && date.getMonth() === hoje.getMonth() && date.getDate() === hoje.getDate();
};

const isHorarioPassado = (horario: string, dataSelecionada?: Date) => {
  if (!isHoje(dataSelecionada)) return false;
  const agora = new Date();
  const [h, m] = horario.split(":").map(Number);
  return h < agora.getHours() || (h === agora.getHours() && m <= agora.getMinutes());
};

/** Check if booking at `horario` with `duracao` min would overlap any occupied slot */
const temConflito = (horario: string, duracao: number, ocupados: string[]): boolean => {
  const [h, m] = horario.split(":").map(Number);
  const inicio = h * 60 + m;
  for (let t = inicio; t < inicio + duracao; t += 30) {
    const hh = Math.floor(t / 60).toString().padStart(2, "0");
    const mm = (t % 60).toString().padStart(2, "0");
    if (ocupados.includes(`${hh}:${mm}`)) return true;
  }
  return false;
};

const TimeSlotGrid = ({ horariosOcupados, horarioSelecionado, onSelect, loading, dataSelecionada, duracaoServico = 30 }: TimeSlotGridProps) => {
  const horarios = dataSelecionada
    ? gerarHorarios(dataSelecionada.getDay(), duracaoServico)
    : [];

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (horarios.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum horário disponível neste dia.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {horarios.map((horario) => {
        const conflito = temConflito(horario, duracaoServico, horariosOcupados);
        const passado = isHorarioPassado(horario, dataSelecionada);
        const indisponivel = conflito || passado;
        const selecionado = horarioSelecionado === horario;

        return (
          <button
            key={horario}
            disabled={indisponivel}
            onClick={() => onSelect(horario)}
            className={cn(
              "h-12 rounded-lg font-medium text-sm transition-all border",
              passado
                ? "bg-muted text-muted-foreground border-border cursor-not-allowed line-through opacity-40"
                : conflito
                  ? "bg-destructive/20 text-destructive border-destructive/30 cursor-not-allowed line-through opacity-60"
                  : selecionado
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                    : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/10"
            )}
          >
            {horario}
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotGrid;
