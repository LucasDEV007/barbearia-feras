// Edge function: cria a ÚNICA conta de barbeiro permitida no sistema.
// Pública (verify_jwt = false), mas exige header `x-setup-secret` igual ao
// segredo SETUP_SECRET para evitar account takeover/enumeration.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-setup-secret",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Constant-time string comparison to avoid timing attacks
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const expected = Deno.env.get("SETUP_SECRET");
    if (!expected) {
      console.error("setup-barbeiro: SETUP_SECRET not configured");
      return new Response(JSON.stringify({ error: "Configuração indisponível." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const provided = req.headers.get("x-setup-secret") ?? "";
    if (!safeEqual(provided, expected)) {
      // Generic 401 — do not leak whether the secret or the account exists.
      return new Response(JSON.stringify({ error: "Não autorizado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (req.method === "GET") {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (error) throw error;
      return new Response(JSON.stringify({ exists: (data.users?.length ?? 0) > 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { nome, email, password } = await req.json();
    if (!nome || !email || !password || password.length < 6) {
      return new Response(JSON.stringify({ error: "Dados inválidos. Senha mínimo 6 caracteres." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (listErr) throw listErr;
    if ((list.users?.length ?? 0) > 0) {
      return new Response(JSON.stringify({ error: "Já existe uma conta de barbeiro cadastrada." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    });
    if (createErr) throw createErr;

    // Assign barbeiro role
    if (created?.user?.id) {
      const { error: roleErr } = await admin
        .from("user_roles")
        .insert({ user_id: created.user.id, role: "barbeiro" });
      if (roleErr) throw roleErr;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("setup-barbeiro error:", e);
    return new Response(
      JSON.stringify({ error: "Erro interno. Tente novamente mais tarde." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
