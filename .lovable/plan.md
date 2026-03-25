

## Melhorias Barbearia Feras — Plano de Implementação

Baseado nas referências enviadas, o plano cobre: dashboard avançado, gestão de clientes, gestão financeira, automação WhatsApp e seção de localização.

---

### 1. Dashboard Admin Avançado (Visão Geral)

Redesenhar `/admin` com layout inspirado nas referências:

**KPI Cards (topo):**
- Agendamentos Hoje, Atendimentos Concluídos, Faturamento Estimado, Ticket Médio, Faltas
- Cada card com ícone, valor grande e indicador de variação

**Seção Business Intelligence:**
- Filtro por período (7, 15, 30 dias)
- Cards: Faturamento Bruto, Total Despesas, Lucro Real, Atendimentos
- Gráfico de Fluxo de Faturamento (Recharts line chart)
- Mix de Serviços (top 5 serviços mais realizados)

**Tabela de agendamentos** permanece abaixo, com filtro por data.

**Database:** Criar tabela `atendimentos` para registrar serviços concluídos (permite calcular faturamento e estatísticas). Botão "Concluir" na lista de agendamentos para marcar como atendido.

---

### 2. Gestão de Clientes

Nova página `/admin/clientes`:

- Cards resumo: Total, Ativos, Novos, Taxa de Retorno
- Busca por nome/telefone
- Tabela: Cliente, Frequência, Última Visita, Ação (Ver)
- Seção "Top Clientes" (mais receita gerada)

**Database:** Criar tabela `clientes` (nome, telefone, created_at) — populada automaticamente a partir dos agendamentos. Ou calcular dinamicamente via queries na tabela `agendamentos`.

---

### 3. Gestão Financeira (Contas & Despesas)

Nova página `/admin/financeiro`:

- Header: "Contas & Despesas" com totais (A Pagar do Mês, Total Lançado)
- Formulário "Novo Lançamento": descrição, valor, vencimento, categoria, checkbox "Já está pago?"
- Filtros: Tudo, Pendentes, Pagos
- Lista de gastos com status

**Database:** Criar tabela `despesas` (descricao, valor, vencimento, categoria, pago boolean, user_id).

---

### 4. Automação WhatsApp

**Fluxo:**
1. Cliente confirma agendamento → Edge Function envia mensagem de confirmação imediata via Twilio/WhatsApp
2. Cron job (pg_cron) roda a cada 5 minutos → busca agendamentos confirmados nos próximos 30min → envia lembrete
3. Após horário do corte → envia mensagem de pós-venda/avaliação com link

**Modelos de Mensagem** (página `/admin/mensagens`):
- Confirmação Imediata
- Lembrete de Agendamento (30min antes)
- Pós-Venda / Avaliação

**Database:** Criar tabela `mensagem_templates` (tipo, conteudo, ativo). Tabela `mensagens_enviadas` (agendamento_id, tipo, enviado_em) para evitar duplicatas.

**Requisito:** Conectar Twilio via connector para envio de WhatsApp.

---

### 5. Seção de Localização (Landing Page)

Adicionar seção antes do footer em `/`:

- Título "Nossa Localização"
- Endereço da barbearia (texto + ícone)
- Embed Google Maps iframe com localização
- Botões: "Como chegar" (abre Google Maps) e nome da unidade
- Horário de funcionamento

---

### 6. Navegação Admin

Adicionar sidebar ou tabs no admin para navegar entre:
- Visão Geral (dashboard)
- Agenda (lista atual)
- Clientes
- Financeiro
- Mensagens/Lembretes

---

### Ordem de Implementação

1. Seção de Localização na landing (rápido, visual)
2. Dashboard Admin redesenhado com KPIs
3. Migrations para novas tabelas (despesas, mensagem_templates, mensagens_enviadas)
4. Gestão de Clientes
5. Gestão Financeira
6. Conectar Twilio + Edge Functions para WhatsApp
7. Navegação admin com tabs/sidebar

---

### Detalhes Técnicos

**Novas migrations:**
```sql
-- Tabela despesas
CREATE TABLE despesas (id uuid PK, descricao text, valor numeric, vencimento date, categoria text, pago boolean DEFAULT false, created_at timestamptz, user_id uuid);

-- Tabela mensagem_templates
CREATE TABLE mensagem_templates (id uuid PK, tipo text, conteudo text, ativo boolean DEFAULT true);

-- Tabela mensagens_enviadas
CREATE TABLE mensagens_enviadas (id uuid PK, agendamento_id uuid FK, tipo text, enviado_em timestamptz);
```

**Edge Functions:**
- `send-whatsapp`: recebe agendamento_id + tipo, busca template, envia via Twilio gateway
- `check-reminders`: cron cada 5min, busca agendamentos próximos 30min, envia lembretes não enviados

**Novas rotas:**
```
/admin          → Dashboard (Visão Geral)
/admin/agenda   → Agenda do dia (existente)
/admin/clientes → Gestão de Clientes
/admin/financeiro → Contas & Despesas
/admin/mensagens  → Modelos de Mensagem
```

