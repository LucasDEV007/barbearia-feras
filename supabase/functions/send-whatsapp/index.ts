import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const { agendamento_id, tipo } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get agendamento
    const { data: ag, error: agErr } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("id", agendamento_id)
      .single();

    if (agErr || !ag) {
      return new Response(JSON.stringify({ error: "Agendamento não encontrado" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check if already sent
    const { data: existing } = await supabase
      .from("mensagens_enviadas")
      .select("id")
      .eq("agendamento_id", agendamento_id)
      .eq("tipo", tipo)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ message: "Já enviada" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get template
    const { data: template } = await supabase
      .from("mensagem_templates")
      .select("*")
      .eq("tipo", tipo)
      .eq("ativo", true)
      .single();

    if (!template) {
      return new Response(JSON.stringify({ error: "Template não encontrado ou inativo" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build message
    const message = template.conteudo
      .replace(/\{\{nome\}\}/g, ag.nome_cliente)
      .replace(/\{\{servico\}\}/g, ag.servico)
      .replace(/\{\{data\}\}/g, ag.data)
      .replace(/\{\{horario\}\}/g, ag.horario)
      .replace(/\{\{link_avaliacao\}\}/g, `https://barbearia-feras.lovable.app/avaliar?id=${ag.id}`);

    // Get Twilio phone number
    const numbersRes = await fetch(`${GATEWAY_URL}/IncomingPhoneNumbers.json`, {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
      },
    });
    const numbersData = await numbersRes.json();
    const fromNumber = numbersData?.incoming_phone_numbers?.[0]?.phone_number;

    if (!fromNumber) {
      return new Response(JSON.stringify({ error: "Nenhum número Twilio configurado" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Format phone for WhatsApp
    let phone = ag.telefone.replace(/\D/g, "");
    if (!phone.startsWith("55")) phone = "55" + phone;

    // Send via WhatsApp
    const twilioRes = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `whatsapp:+${phone}`,
        From: `whatsapp:${fromNumber}`,
        Body: message,
      }),
    });

    const twilioData = await twilioRes.json();
    if (!twilioRes.ok) {
      throw new Error(`Twilio error [${twilioRes.status}]: ${JSON.stringify(twilioData)}`);
    }

    // Record sent
    await supabase.from("mensagens_enviadas").insert({
      agendamento_id,
      tipo,
    });

    return new Response(JSON.stringify({ success: true, sid: twilioData.sid }), {
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
