-- =========================================================
-- ClinOS PADDI SaaS v3 — Supabase schema de teste
-- Rode este arquivo no Supabase SQL Editor.
-- Modo teste: leitura pública com anon key. Para produção, restringir com auth.uid() e tenant_id.
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  nome text not null default 'PADDI',
  slug text unique not null default 'paddi',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists clinics (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  nome_fantasia text not null,
  razao_social text,
  telefone text,
  cidade text,
  uf text,
  endereco text,
  descricao text,
  created_at timestamptz not null default now()
);

create table if not exists patients (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  nome text not null,
  telefone text,
  cpf text,
  data_cadastro text,
  convenio text,
  indicacao text,
  responsavel text,
  status text default 'Ativo',
  origem text default 'Supabase',
  row integer,
  created_at timestamptz not null default now()
);

create table if not exists professionals (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  nome text not null,
  especialidade_principal text,
  agendamentos integer default 0,
  produtividade numeric default 0,
  status text default 'Ativo',
  created_at timestamptz not null default now()
);

create table if not exists specialties (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  nome text not null,
  agendamentos integer default 0,
  status text default 'Ativo',
  created_at timestamptz not null default now()
);

create table if not exists payers (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  nome text not null,
  agendamentos integer default 0,
  status text default 'Ativo',
  created_at timestamptz not null default now()
);

create table if not exists insurance_guides (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  paciente text,
  convenio text,
  numero_guia text,
  senha text,
  vencimento text,
  procedimento text,
  usadas integer default 0,
  autorizadas integer default 10,
  status text default 'Em uso',
  created_at timestamptz not null default now()
);

create table if not exists schedule_events (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  clinica text,
  data text,
  horario text,
  observacao text,
  sessao text,
  paciente text not null,
  contato text,
  especialidade text,
  sala text,
  tipo_agendamento text,
  convenio text,
  plano text,
  status text default 'Agendado',
  profissional text,
  numero_guia text,
  matricula text,
  indicacao text,
  senha text,
  venc_guia text,
  procedimentos text,
  idade text,
  financeiro text default 'Previsão',
  tiss text default 'Não se aplica',
  row integer,
  created_at timestamptz not null default now()
);

create table if not exists qa_import_stats (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  pacientes_cadastro integer default 0,
  agendamentos integer default 0,
  pacientes_distintos_agenda integer default 0,
  profissionais integer default 0,
  especialidades integer default 0,
  convenios integer default 0,
  guias integer default 0,
  pacientes_agenda_nao_encontrados integer default 0,
  nomes_duplicados integer default 0,
  telefones_duplicados integer default 0,
  raw_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  action text not null,
  entity text,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_patients_nome on patients using gin (to_tsvector('portuguese', coalesce(nome,'')));
create index if not exists idx_schedule_paciente on schedule_events using gin (to_tsvector('portuguese', coalesce(paciente,'')));
create index if not exists idx_schedule_profissional on schedule_events(profissional);
create index if not exists idx_schedule_guia on schedule_events(numero_guia);
create index if not exists idx_guides_numero on insurance_guides(numero_guia);

-- RLS de teste
alter table tenants enable row level security;
alter table clinics enable row level security;
alter table patients enable row level security;
alter table professionals enable row level security;
alter table specialties enable row level security;
alter table payers enable row level security;
alter table insurance_guides enable row level security;
alter table schedule_events enable row level security;
alter table qa_import_stats enable row level security;
alter table audit_logs enable row level security;

-- Políticas abertas SOMENTE PARA TESTE.
-- Em produção, remova estas policies e use auth.uid()/tenant_user_roles.
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'demo_select_all_patients') then
    create policy demo_select_all_patients on patients for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'demo_insert_patients') then
    create policy demo_insert_patients on patients for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'demo_update_patients') then
    create policy demo_update_patients on patients for update using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'demo_select_all_schedule') then
    create policy demo_select_all_schedule on schedule_events for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'demo_insert_schedule') then
    create policy demo_insert_schedule on schedule_events for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'demo_update_schedule') then
    create policy demo_update_schedule on schedule_events for update using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'demo_select_all_guides') then
    create policy demo_select_all_guides on insurance_guides for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'demo_insert_guides') then
    create policy demo_insert_guides on insurance_guides for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'demo_update_guides') then
    create policy demo_update_guides on insurance_guides for update using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'demo_select_all_public') then
    create policy demo_select_all_public on tenants for select using (true);
    create policy demo_select_all_clinics on clinics for select using (true);
    create policy demo_select_all_professionals on professionals for select using (true);
    create policy demo_select_all_specialties on specialties for select using (true);
    create policy demo_select_all_payers on payers for select using (true);
    create policy demo_select_all_qa on qa_import_stats for select using (true);
  end if;
end $$;
