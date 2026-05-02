# ClinOS PADDI SaaS v3 — Supabase Ready

Esta versão conecta o front Next.js ao Supabase.

## Rodar local

```bash
npm install
npm run dev
```

## Conectar Supabase

Leia:

```text
MANUAL_SUPABASE.md
```

Resumo:

1. Crie o projeto no Supabase.
2. Rode `supabase_schema.sql` no SQL Editor.
3. Copie `.env.local.example` para `.env.local`.
4. Preencha URL, anon key e service role.
5. Rode:

```bash
npm run seed:supabase
npm run test:supabase
npm run dev
```

## Arquivos importantes

- `supabase_schema.sql` — cria as tabelas no Supabase.
- `scripts/seed-supabase.mjs` — carrega os dados reais do JSON para o Supabase.
- `scripts/test-supabase.mjs` — testa se a conexão está correta.
- `data/seed.json` — dados importados dos Excel.
- `MANUAL_SUPABASE.md` — passo a passo completo.
