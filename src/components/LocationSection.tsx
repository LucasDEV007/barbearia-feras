import { MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const ENDERECO = "Rua das Palmeiras, 123 — Centro, São Paulo - SP";
const MAPS_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197547850021!2d-46.65342668502156!3d-23.56141698468097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1700000000000";
const MAPS_LINK = "https://www.google.com/maps/dir/?api=1&destination=-23.5614,-46.6534";

const LocationSection = () => (
  <section className="py-16 px-4 bg-card/50">
    <div className="max-w-5xl mx-auto">
      <h2
        className="text-3xl font-bold text-center text-foreground mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Nossa Localização
      </h2>
      <p className="text-muted-foreground text-center mb-10">
        Venha nos visitar!
      </p>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-border aspect-video">
          <iframe
            src={MAPS_EMBED}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização Barbearia Feras"
          />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">Endereço</h3>
              <p className="text-muted-foreground text-sm">{ENDERECO}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">Horário de Funcionamento</h3>
              <div className="text-muted-foreground text-sm space-y-0.5">
                <p>Seg a Sex: 09:00 — 19:30</p>
                <p>Sábado: 09:00 — 17:00</p>
                <p>Domingo: Fechado</p>
              </div>
            </div>
          </div>

          <Button asChild className="w-full font-semibold gap-2">
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4" />
              Como chegar
            </a>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default LocationSection;
