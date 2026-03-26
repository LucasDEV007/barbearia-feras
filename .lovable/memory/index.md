Barbearia Feras — dark theme with gold accents, Supabase backend

## Design
- Theme: dark background (230 25% 10%) + gold primary (43 70% 53%)
- Fonts: Playfair Display (headings) + Inter (body)
- All colors via HSL CSS variables in index.css

## Architecture
- Supabase: agendamentos, despesas, mensagem_templates, mensagens_enviadas
- RLS: public insert/select on agendamentos, authenticated CRUD on despesas (scoped to user_id), authenticated ALL on templates
- Pages: / (landing), /agendar (booking), /login, /admin (layout with sidebar)
- Admin sub-routes: /admin (dashboard), /admin/agenda, /admin/clientes, /admin/financeiro, /admin/mensagens
- AdminLayout uses SidebarProvider with AdminSidebar component

## Services
- Corte R$35, Barba R$25, Sobrancelha R$15, Combo R$50

## WhatsApp Automation
- Twilio connector linked via gateway
- Edge functions: send-whatsapp, check-reminders (cron every 5min)
- Types: confirmacao (on booking), lembrete (30min before), pos_venda (1h after completion)
