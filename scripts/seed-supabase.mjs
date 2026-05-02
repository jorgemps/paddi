import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local ou nas variáveis de ambiente.");
  process.exit(1);
}

const supabase = createClient(url, key);
const seed = JSON.parse(fs.readFileSync(new URL("../data/seed.json", import.meta.url), "utf-8"));

async function chunkInsert(table, rows, size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    const part = rows.slice(i, i + size);
    const { error } = await supabase.from(table).insert(part);
    if (error) {
      console.error(`Erro inserindo ${table}:`, error.message);
      process.exit(1);
    }
    console.log(`${table}: ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
}

async function main() {
  console.log("Limpando tabelas de teste...");
  for (const table of ["audit_logs","qa_import_stats","schedule_events","insurance_guides","payers","specialties","professionals","patients","clinics","tenants"]) {
    await supabase.from(table).delete().neq("id", -999999);
  }

  const { data: tenant, error: tenantError } = await supabase.from("tenants").insert({
    nome: "PADDI",
    slug: "paddi",
    status: "active"
  }).select("*").single();
  if (tenantError) throw tenantError;

  const tid = tenant.id;

  await supabase.from("clinics").insert({
    tenant_id: tid,
    nome_fantasia: seed.clinica.nomeFantasia,
    razao_social: seed.clinica.razaoSocial,
    telefone: seed.clinica.telefone,
    cidade: seed.clinica.cidade,
    uf: seed.clinica.uf,
    endereco: seed.clinica.endereco,
    descricao: seed.clinica.descricao
  });

  await chunkInsert("patients", seed.patients.map(p => ({
    tenant_id: tid,
    nome: p.nome,
    telefone: p.telefone,
    cpf: p.cpf,
    data_cadastro: p.dataCadastro,
    convenio: p.convenio,
    indicacao: p.indicacao,
    responsavel: p.responsavel,
    status: p.status,
    origem: p.origem,
    row: p.row
  })));

  await chunkInsert("professionals", seed.professionals.map(p => ({
    tenant_id: tid,
    nome: p.nome,
    especialidade_principal: p.especialidadePrincipal,
    agendamentos: p.agendamentos,
    produtividade: p.produtividade,
    status: p.status
  })));

  await chunkInsert("specialties", seed.specialties.map(s => ({
    tenant_id: tid,
    nome: s.nome,
    agendamentos: s.agendamentos,
    status: s.status
  })));

  await chunkInsert("payers", seed.payers.map(p => ({
    tenant_id: tid,
    nome: p.nome,
    agendamentos: p.agendamentos,
    status: p.status
  })));

  await chunkInsert("insurance_guides", seed.guides.map(g => ({
    tenant_id: tid,
    paciente: g.paciente,
    convenio: g.convenio,
    numero_guia: g.numeroGuia,
    senha: g.senha,
    vencimento: g.vencimento,
    procedimento: g.procedimento,
    usadas: g.usadas,
    autorizadas: g.autorizadas,
    status: g.status
  })));

  await chunkInsert("schedule_events", seed.agenda.map(a => ({
    tenant_id: tid,
    clinica: a.clinica,
    data: a.data,
    horario: a.horario,
    observacao: a.observacao,
    sessao: a.sessao,
    paciente: a.paciente,
    contato: a.contato,
    especialidade: a.especialidade,
    sala: a.sala,
    tipo_agendamento: a.tipoAgendamento,
    convenio: a.convenio,
    plano: a.plano,
    status: a.status,
    profissional: a.profissional,
    numero_guia: a.numeroGuia,
    matricula: a.matricula,
    indicacao: a.indicacao,
    senha: a.senha,
    venc_guia: a.vencGuia,
    procedimentos: a.procedimentos,
    idade: a.idade,
    financeiro: a.financeiro,
    tiss: a.tiss,
    row: a.row
  })));

  await supabase.from("qa_import_stats").insert({
    tenant_id: tid,
    pacientes_cadastro: seed.meta.qa.pacientesCadastro,
    agendamentos: seed.meta.qa.agendamentos,
    pacientes_distintos_agenda: seed.meta.qa.pacientesDistintosAgenda,
    profissionais: seed.meta.qa.profissionais,
    especialidades: seed.meta.qa.especialidades,
    convenios: seed.meta.qa.convenios,
    guias: seed.meta.qa.guias,
    pacientes_agenda_nao_encontrados: seed.meta.qa.pacientesAgendaNaoEncontradosCadastroAprox,
    nomes_duplicados: seed.meta.qa.nomesDuplicados,
    telefones_duplicados: seed.meta.qa.telefonesDuplicados,
    raw_json: seed.meta.qa
  });

  console.log("Carga concluída com sucesso.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
