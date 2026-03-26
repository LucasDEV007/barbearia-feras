import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  if (!TWILIO_API_KEY) {
    return new Response(JSON.stringify({ error: "TWILIO_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Current time + 30min window
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${h}:${m}`;

    const future = new Date(now.getTime() + 35 * 60000);
    const fh = future.getHours().toString().padStart(2, "0");
    const fm = future.getMinutes().toString().padStart(2, "0");
    const futureTime = `${fh}:${fm}`;

    // Find appointments in the next ~30 min window
    const { data: upcoming } = await supabase
      .from("agendamentos")
      .select("id, horario")
      .eq("data", today)
      .eq("status", "confirmado")
      .gte("horario", currentTime)
      .lte("horario", futureTime);

    if (!upcoming || upcoming.length === 0) {
      return new Response(JSON.stringify({ message: "No reminders needed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Also find completed appointments for post-sale (1h+ after appointment time)
    const pastHour = new Date(now.getTime() - 60 * 60000);
    const ph = pastHour.getHours().toString().padStart(2, "0");
    const pm = pastHour.getMinutes().toString().padStart(2, "0");
    const pastTime = `${ph}:${pm}`;

    const { data: completed } = await supabase
      .from("agendamentos")
      .select("id")
      .eq("data", today)
      .eq("status", "concluido")
      .lte("horario", pastTime);

    const results: string[] = [];

    // Send reminders
    for (const ag of upcoming) {
      const projectId = Deno.env.get("SUPABASE_URL")!.match(/\/\/(.*?)\./)?.[1] || "";
      const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`;

      const res = await fetch(fnUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
        body: JSON.stringify({ agendamento_id: ag.id, tipo: "lembrete" }),
      });
      const body = await res.text();
      results.push(`lembrete ${ag.id}: ${res.status}`);
    }

    // Send post-sale for completed
    if (completed) {
      for (const ag of completed) {
        const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`;
        const res = await fetch(fnUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
          body: JSON.stringify({ agendamento_id: ag.id, tipo: "pos_venda" }),
        });
        const body = await res.text();
        results.push(`pos_venda ${ag.id}: ${res.status}`);
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
