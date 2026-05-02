@echo off
cd /d %~dp0
echo ===============================================
echo ClinOS PADDI SaaS v3 - Supabase
echo ===============================================
echo.
echo 1) Antes, crie o projeto no Supabase.
echo 2) Rode supabase_schema.sql no SQL Editor.
echo 3) Edite .env.local com suas chaves.
echo.
if not exist .env.local (
  copy .env.local.example .env.local
  echo Arquivo .env.local criado. Edite ele antes de continuar.
  pause
)
npm install
npm run test:supabase
npm run dev
pause
