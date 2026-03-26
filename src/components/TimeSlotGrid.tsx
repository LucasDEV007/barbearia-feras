import { HORARIOS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlotGridProps {
  horariosOcupados: string[];
  horarioSelecionado: string | null;
  onSelect: (horario: string) => void;
  loading?: boolean;
  dataSelecionada?: Date;
}

const TimeSlotGrid = ({ horariosOcupados, horarioSelecionado, onSelect, loading }: TimeSlotGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {Array.from({ length: 21 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {HORARIOS.map((horario) => {
        const ocupado = horariosOcupados.includes(horario);
        const selecionado = horarioSelecionado === horario;

        return (
          <button
            key={horario}
            disabled={ocupado}
            onClick={() => onSelect(horario)}
            className={cn(
              "h-12 rounded-lg font-medium text-sm transition-all border",
              ocupado
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
