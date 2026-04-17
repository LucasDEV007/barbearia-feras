// Edge function: cria a ÚNICA conta de barbeiro permitida no sistema.
// Pública (verify_jwt = false). Bloqueia se já existir qualquer usuário.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    });
    if (createErr) throw createErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
