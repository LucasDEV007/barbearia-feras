import { MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const ENDERECO = "R. Prof. José Henrique, 1320 - Guajeru, Fortaleza - CE, 60843-270";
const MAPS_EMBED = "https://maps.google.com/maps?q=R.+Prof.+Jos%C3%A9+Henrique,+1320+-+Guajeru,+Fortaleza+-+CE,+60843-270&t=&z=17&ie=UTF8&iwloc=&output=embed";
const MAPS_LINK = "https://maps.app.goo.gl/2de33R82W4RfUdzG9";

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
