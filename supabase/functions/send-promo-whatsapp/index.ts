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
    const { telefone, mensagem } = await req.json();

    if (!telefone || !mensagem) {
      return new Response(JSON.stringify({ error: "telefone e mensagem são obrigatórios" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get Twilio phone number
    let fromNumber = "+14155238886";
    try {
      const numbersRes = await fetch(`${GATEWAY_URL}/IncomingPhoneNumbers.json`, {
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
        },
      });
      const numbersData = await numbersRes.json();
      if (numbersData?.incoming_phone_numbers?.[0]?.phone_number) {
        fromNumber = numbersData.incoming_phone_numbers[0].phone_number;
      }
    } catch (e) {
      console.log("Using sandbox number as fallback");
    }

    let phone = telefone.replace(/\D/g, "");
    if (!phone.startsWith("55")) phone = "55" + phone;

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
        Body: mensagem,
      }),
    });

    const twilioData = await twilioRes.json();
    if (!twilioRes.ok) {
      throw new Error(`Twilio error [${twilioRes.status}]: ${JSON.stringify(twilioData)}`);
    }

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
