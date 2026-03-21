

## Barbearia Feras — Plano de Implementação Completo

O projeto está vazio (página placeholder). Vamos construir tudo do zero.

---

### 1. Setup Supabase

**Conectar Supabase** ao projeto e criar:

**Migration 1 — Tabela `agendamentos`:**
```sql
CREATE TABLE agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_cliente text NOT NULL,
  telefone text NOT NULL,
  servico text NOT NULL,
  data date NOT NULL,
  horario text NOT NULL,
  status text NOT NULL DEFAULT 'confirmado',
  created_at timestamptz DEFAULT now(),
  UNIQUE(data, horario, status) -- constraint parcial via index abaixo
);

-- Impedir dois agendamentos confirmados no mesmo horário
CREATE UNIQUE INDEX idx_unique_agendamento_confirmado 
  ON agendamentos (data, horario) WHERE status = 'confirmado';

-- RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (cliente)
CREATE POLICY "Clientes podem agendar" ON agendamentos FOR INSERT WITH CHECK (true);
-- Qualquer um pode ler (para verificar disponibilidade)
CREATE POLICY "Leitura pública" ON agendamentos FOR SELECT USING (true);
-- Apenas autenticados podem atualizar (cancelar)
CREATE POLICY "Admin pode atualizar" ON agendamentos FOR UPDATE TO authenticated USING (true);
```

**Autenticação:** Criar um usuário barbeiro via Supabase Auth (email/senha).

---

### 2. Tema Visual (Dark + Dourado)

Atualizar `src/index.css` com tema escuro como padrão:
- Background: tons escuros (#1a1a2e, #16213e)
- Accent/Primary: dourado (#d4af37)
- Cards: fundo escuro com borda dourada sutil

---

### 3. Estrutura de Arquivos

```text
src/
├── integrations/supabase/    # client + types (auto)
├── lib/utils.ts
├── pages/
│   ├── Index.tsx             # Landing page
│   ├── Agendar.tsx           # Agendamento
│   ├── Admin.tsx             # Painel barbeiro
│   └── Login.tsx             # Login admin
├── components/
│   ├── HeroSection.tsx       # Hero da landing
│   ├── ServicosSection.tsx   # Cards de serviços
│   ├── TimeSlotGrid.tsx      # Grade de horários (verde/vermelho)
│   ├── AgendamentoForm.tsx   # Formulário nome+tel
│   ├── AgendaList.tsx        # Lista de agendamentos (admin)
│   ├── AgendaSummary.tsx     # Resumo do dia (admin)
│   └── ConfirmacaoDialog.tsx # Dialog de confirmação
└── App.tsx                   # Rotas
```

---

### 4. Páginas e Componentes

**Landing (`/`):**
- Hero com nome "Barbearia Feras", tagline, botão CTA dourado
- Seção de serviços com preços em cards
- Footer simples

**Agendamento (`/agendar`):**
- Step 1: Selecionar serviço (cards clicáveis)
- Step 2: Selecionar data (Calendar component)
- Step 3: Selecionar horário (grade 09:00-19:00, 30min)
  - Verde = disponível, Vermelho = ocupado (busca Supabase)
  - Horários ocupados desabilitados
- Step 4: Formulário (nome, telefone)
- Confirmação: Dialog com resumo (serviço, data, horário) + toast sucesso
- Erro se horário já ocupado (constraint DB + feedback)

**Login (`/login`):**
- Formulário email/senha via Supabase Auth
- Redireciona para `/admin`

**Admin (`/admin`):**
- Protegida (redireciona se não autenticado)
- Filtro por data (datepicker)
- Resumo: total de agendamentos do dia
- Tabela com: horário, nome, telefone (com botão copiar), serviço, status
- Ordenação automática por horário
- Botão cancelar em cada linha (atualiza status para "cancelado")
- Loading skeleton enquanto carrega
- Botão logout

---

### 5. Lógica Principal

- **Buscar horários ocupados:** Query Supabase para data selecionada onde status = 'confirmado'
- **Gerar grade:** Array de slots 09:00 a 19:00 (30min), marcando ocupados
- **Inserir agendamento:** Insert com tratamento de erro de constraint unique
- **Cancelar:** Update status para 'cancelado' (libera o horário)
- **Copiar telefone:** `navigator.clipboard.writeText()`
- **Loading:** Skeleton components durante fetches

---

### 6. Rotas (App.tsx)

```
/         → Index (landing)
/agendar  → Agendar
/login    → Login
/admin    → Admin (protegida)
```

