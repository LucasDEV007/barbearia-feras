import { useState } from "react";
import { MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const ENDERECO = "R. Prof. José Henrique, 1320 - Guajeru, Fortaleza - CE, 60843-270";
const MAPS_EMBED = "https://maps.google.com/maps?q=-3.8307956,-38.4782368&z=18&ie=UTF8&iwloc=B&output=embed";
const MAPS_LINK = "https://www.google.com/maps/place/Fera's+Barbershop/@-3.8307902,-38.4808117,763m/data=!3m2!1e3!4b1!4m6!3m5!1s0x7c74553dc49b12b:0x599f5f0128ac8be5!8m2!3d-3.8307956!4d-38.4782368!16s%2Fg%2F11c6c99ljk?hl=pt-BR&entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D";

const LocationSection = () => {
  const [showMap, setShowMap] = useState(false);

  return (
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
          {showMap ? (
            <iframe
              src={MAPS_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Fera's Barbershop"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="w-full h-full flex flex-col items-center justify-center gap-3 bg-secondary/50 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08),transparent_70%)] hover:bg-secondary/70 transition-colors group"
              aria-label="Carregar mapa interativo"
            >
              <MapPin className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm text-muted-foreground">Mapa interativo</span>
              <span className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                Ver localização
              </span>
            </button>
          )}
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
                <p>Seg a Qui: 09:00 — 12:00 / 14:00 — 17:00</p>
                <p>Sex e Sáb: 09:00 — 12:00 / 14:00 — 20:00</p>
                <p>Domingo: 09:00 — 12:00</p>
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
};

export default LocationSection;
