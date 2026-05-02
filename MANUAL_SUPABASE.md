# Manual — Conectar ClinOS PADDI ao Supabase

## 1. Criar projeto no Supabase

1. Acesse o Supabase.
2. Crie um novo projeto.
3. Guarde a senha do banco.
4. Espere o projeto ficar ativo.

O Supabase usa PostgreSQL como banco principal, além de Auth, APIs automáticas, Storage e Realtime. Isso combina com o modelo SaaS que estamos montando.

## 2. Criar as tabelas

1. No Supabase, abra **SQL Editor**.
2. Clique em **New Query**.
3. Copie todo o conteúdo do arquivo:

```text
supabase_schema.sql
```

4. Clique em **Run**.

Esse SQL cria:

- tenants
- clinics
- patients
- professionals
- specialties
- payers
- insurance_guides
- schedule_events
- qa_import_stats
- audit_logs
- índices
- RLS em modo teste

## 3. Configurar variáveis do projeto Next.js

Na pasta do projeto, copie:

```bash
copy .env.local.example .env.local
```

No Linux:

```bash
cp .env.local.example .env.local
```

Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

Onde pegar isso:

- `NEXT_PUBLIC_SUPABASE_URL`: Project Settings / API / Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project Settings / API / anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings / API / service_role key

A chave `service_role` só deve ficar no computador/servidor backend. Não use essa chave em tela pública.

## 4. Instalar dependências

```bash
npm install
```

## 5. Carregar dados reais no Supabase

Depois de preencher `.env.local`, rode:

```bash
npm run seed:supabase
```

Esse comando carrega no banco:

- 1.732 pacientes
- agenda importada
- profissionais
- especialidades
- convênios
- guias
- indicadores QA

## 6. Testar conexão

```bash
npm run test:supabase
```

Resultado esperado:

```text
clinics: OK
patients: OK
schedule_events: OK
insurance_guides: OK
professionals: OK
qa_import_stats: OK
```

## 7. Rodar o sistema

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

Na tela inicial, o sistema vai mostrar:

- **Conectado ao Supabase**, quando carregou do banco.
- **Modo local**, quando `.env.local` não está configurado.
- **Erro Supabase**, quando as tabelas/policies ainda não foram criadas.

## 8. O que já persiste no Supabase

Nesta versão v3:

- novo paciente
- novo agendamento
- finalizar atendimento
- consumir guia

## 9. O que ainda é simulado

Ainda estão em modo visual/teste:

- WhatsApp real
- IA real
- NFS-e real
- DMED real
- XML TISS real
- autenticação de usuários
- RLS por usuário/perfil

## 10. Próximo passo depois da conexão

A sequência correta:

1. Ativar Supabase Auth.
2. Criar tabela `tenant_users`.
3. Trocar políticas abertas por políticas baseadas em `auth.uid()`.
4. Criar backend para:
   - WhatsApp
   - IA
   - TISS XML
   - NFS-e
   - DMED
5. Colocar o frontend na Vercel.
