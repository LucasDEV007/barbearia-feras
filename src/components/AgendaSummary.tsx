import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Clock, Users } from "lucide-react";

interface AgendaSummaryProps {
  total: number;
  confirmados: number;
  cancelados: number;
}

const AgendaSummary = ({ total, confirmados, cancelados }: AgendaSummaryProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <CalendarCheck className="h-8 w-8 text-green-400" />
          <div>
            <p className="text-2xl font-bold text-foreground">{confirmados}</p>
            <p className="text-xs text-muted-foreground">Confirmados</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <Clock className="h-8 w-8 text-destructive" />
          <div>
            <p className="text-2xl font-bold text-foreground">{cancelados}</p>
            <p className="text-xs text-muted-foreground">Cancelados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaSummary;
