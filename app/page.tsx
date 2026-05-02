"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Bell, Bot, Building2, CalendarDays, Camera,
  CheckCircle2, ClipboardList, CreditCard, Database, Download, Edit3, FileCheck2,
  FileText, Filter, HeartPulse, Lock, MessageCircle, Mic, Plus, Receipt, RefreshCw,
  Save, Search, Send, Settings, ShieldCheck, Sparkles, Stethoscope, UploadCloud,
  UserPlus, UserRound, Users, Wallet, X, XCircle
} from "lucide-react";
import seed from "@/data/seed.json";
import { isSupabaseConfigured } from "@/lib/supabase";
import { loadSupabaseAppData, insertSupabasePatient, insertSupabaseSchedule, updateSupabaseSchedule, updateSupabaseGuide } from "@/lib/supabase-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge, Tone } from "@/components/ui/badge";

type Any = any;

const nav = [
  ["dashboard","Dashboard",BarChart3],
  ["clinica","Clínica",Building2],
  ["pacientes","Pacientes",Users],
  ["agenda","Agenda",CalendarDays],
  ["sessao","Sessão Clínica",HeartPulse],
  ["whatsapp","WhatsApp / CRM",MessageCircle],
  ["portal","Portal dos Pais",UserRound],
  ["guias","Guias / TISS",FileCheck2],
  ["financeiro","Financeiro",Wallet],
  ["glosas","Glosas",XCircle],
  ["fiscal","NFS-e / DMED",Receipt],
  ["profissionais","Profissionais",Stethoscope],
  ["importacao","Importação / QA",UploadCloud],
  ["seguranca","LGPD / Segurança",ShieldCheck],
  ["config","Configurações",Settings],
] as const;

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/15">
        <div className="relative h-7 w-7">
          <span className="absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-teal-200" />
          <span className="absolute right-0 top-2 h-3 w-3 rounded-full border-2 border-teal-200" />
          <span className="absolute left-2.5 top-0 h-3 w-3 rounded-full border-2 border-teal-200" />
          <span className="absolute bottom-0 left-2.5 h-3 w-3 rounded-full border-2 border-teal-200" />
        </div>
      </div>
      <div>
        <p className="text-xl font-black tracking-tight">PADDI</p>
        <p className="text-[11px] font-medium text-white/65">Espaço Integrado de Saúde</p>
      </div>
    </div>
  );
}

function PageTitle({ title, subtitle, children }: { title:string; subtitle:string; children?:React.ReactNode }) {
  return <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div><h1 className="text-2xl font-black tracking-tight text-paddi-navy">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>;
}

function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>{children}</label>;
}

function Stat({ label, value, detail, icon: Icon, tone="teal" }: { label:string; value:string; detail:string; icon:Any; tone?:Tone }) {
  return <Card className="paddi-gradient"><CardContent className="flex items-center justify-between">
    <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-paddi-navy">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>
    <div className="rounded-2xl bg-paddi-navy p-3 text-white"><Icon className="h-5 w-5" /></div>
  </CardContent></Card>
}

function Progress({ value }: { value:number }) {
  return <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-paddi-teal" style={{width:`${Math.min(100, Math.max(0,value))}%`}} /></div>;
}

function Modal({ title, children, onClose }: { title:string; children:React.ReactNode; onClose:()=>void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-paddi-navy/45 p-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white shadow-2xl">
      <div className="sticky top-0 flex items-center justify-between border-b bg-white/95 p-5 backdrop-blur">
        <h2 className="text-lg font-black">{title}</h2><Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>;
}

function App() {
  const [tab,setTab] = useState("dashboard");
  const [clinica,setClinica] = useState(seed.clinica as Any);
  const [patients,setPatients] = useState((seed.patients as Any[]).slice(0,250));
  const [allPatients] = useState(seed.patients as Any[]);
  const [agenda,setAgenda] = useState((seed.agenda as Any[]).slice(0,500));
  const [allAgenda] = useState(seed.agenda as Any[]);
  const [guides,setGuides] = useState((seed.guides as Any[]).slice(0,300));
  const [professionals,setProfessionals] = useState(seed.professionals as Any[]);
  const [log,setLog] = useState<string[]>(["QA iniciado: front v2 com tema PADDI e dados reais importados."]);
  const [theme,setTheme] = useState("paddi");
  const [dbMode,setDbMode] = useState(isSupabaseConfigured ? "supabase-configurado" : "local-demo");
  const [dbMessage,setDbMessage] = useState(isSupabaseConfigured ? "Supabase configurado. Tentando carregar dados..." : "Modo local: configure .env.local para conectar Supabase.");
  function addLog(m:string){ setLog(v => [new Date().toLocaleTimeString("pt-BR")+" — "+m, ...v].slice(0,20)); }

  useEffect(() => {
    async function bootSupabase() {
      if (!isSupabaseConfigured) return;
      const data = await loadSupabaseAppData();
      if (!data) {
        setDbMode("supabase-erro");
        setDbMessage("Supabase configurado, mas as tabelas ainda não existem ou as políticas bloquearam leitura. Rode supabase_schema.sql e npm run seed:supabase.");
        addLog("Falha ao carregar Supabase. Usando dados locais.");
        return;
      }
      if (data.clinic) setClinica({
        nomeFantasia: data.clinic.nome_fantasia || data.clinic.nomeFantasia || "PADDI",
        razaoSocial: data.clinic.razao_social || data.clinic.razaoSocial || "PADDI Espaço Integrado de Saúde",
        telefone: data.clinic.telefone || "",
        cidade: data.clinic.cidade || "",
        uf: data.clinic.uf || "",
        endereco: data.clinic.endereco || "",
        descricao: data.clinic.descricao || ""
      });
      if (data.patients.length) setPatients(data.patients);
      if (data.agenda.length) setAgenda(data.agenda);
      if (data.guides.length) setGuides(data.guides);
      if (data.professionals.length) setProfessionals(data.professionals);
      setDbMode("supabase-online");
      setDbMessage("Conectado ao Supabase. Dados carregados do banco.");
      addLog("Supabase conectado e dados carregados.");
    }
    bootSupabase();
  }, []);
  const props = { clinica,setClinica,patients,setPatients,allPatients,agenda,setAgenda,allAgenda,guides,setGuides,professionals,setProfessionals,log,addLog,theme,setTheme,dbMode,dbMessage };
  const Current = ({dashboard:Dashboard, clinica:Clinica, pacientes:Pacientes, agenda:Agenda, sessao:Sessao, whatsapp:Whatsapp, portal:Portal, guias:Guias, financeiro:Financeiro, glosas:Glosas, fiscal:Fiscal, profissionais:Profissionais, importacao:Importacao, seguranca:Seguranca, config:Config} as Any)[tab] || Dashboard;

  return <div className="min-h-screen">
    <aside className="fixed left-0 top-0 hidden h-screen w-80 border-r border-slate-200/70 bg-white/75 p-4 backdrop-blur-xl lg:block">
      <div className="mb-4 rounded-3xl bg-paddi-navy p-5 text-white shadow-soft"><Logo /></div>
      <div className="mb-4 rounded-3xl border border-teal-100 bg-teal-50 p-4">
        <p className="text-xs font-bold uppercase text-teal-700">Ambiente QA</p>
        <p className="mt-1 text-sm text-teal-900">Dados reais dos Excel importados para teste.</p>
      </div>
      <nav className="space-y-1 overflow-auto pb-4">
        {nav.map(([id,label,Icon]) => <button key={id} onClick={()=>setTab(id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${tab===id ? "bg-paddi-navy text-white shadow-soft" : "text-slate-600 hover:bg-white hover:text-paddi-navy"}`}><Icon className="h-4 w-4" />{label}</button>)}
      </nav>
    </aside>
    <main className="lg:pl-80">
      <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 p-3 backdrop-blur-xl lg:hidden">
        <div className="flex gap-2 overflow-x-auto">{nav.map(([id,label]) => <Button key={id} size="sm" variant={tab===id?"teal":"outline"} onClick={()=>setTab(id)}>{label}</Button>)}</div>
      </div>
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <Current {...props} />
      </div>
    </main>
  </div>;
}

function Dashboard({patients,allPatients,agenda,allAgenda,guides,professionals,log,dbMode,dbMessage}:Any){
  const qa = seed.meta.qa as Any;
  const vencidas = guides.filter((g:Any)=>String(g.status).toLowerCase().includes("venc")).length;
  return <div className="space-y-6">
    <PageTitle title="Painel Executivo PADDI" subtitle="Sistema com conceito profissional: clínica, agenda, pacientes, guias, TISS, financeiro, portal, WhatsApp e QA." >
      <Badge tone={dbMode==="supabase-online"?"success":dbMode==="supabase-erro"?"danger":"warning"}>{dbMessage}</Badge><Button variant="teal"><Sparkles className="h-4 w-4"/> Rodar QA</Button><Button variant="outline"><Bell className="h-4 w-4"/> Alertas</Button>
    </PageTitle>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Pacientes importados" value={String(qa.pacientesCadastro)} detail="Excel real" icon={Users}/>
      <Stat label="Agendamentos" value={String(qa.agendamentos)} detail="abril + maio" icon={CalendarDays}/>
      <Stat label="Profissionais" value={String(qa.profissionais)} detail="agenda real" icon={Stethoscope}/>
      <Stat label="Guias identificadas" value={String(qa.guias)} detail="controle TISS" icon={FileCheck2}/>
      <Stat label="Convênios" value={String(qa.convenios)} detail="pagadores" icon={CreditCard}/>
      <Stat label="Especialidades" value={String(qa.especialidades)} detail="serviços clínicos" icon={HeartPulse}/>
      <Stat label="Agenda sem cadastro" value={String(qa.pacientesAgendaNaoEncontradosCadastroAprox)} detail="corrigir" icon={AlertTriangle}/>
      <Stat label="Telefones duplicados" value={String(qa.telefonesDuplicados)} detail="higienização" icon={RefreshCw}/>
    </div>
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2"><CardContent><h2 className="mb-4 text-lg font-black">Agenda real importada</h2><AgendaRows rows={agenda.slice(0,8)} compact /></CardContent></Card>
      <Card><CardContent><h2 className="mb-4 text-lg font-black">Log QA</h2><div className="space-y-2">{log.map((l:string)=><div key={l} className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">{l}</div>)}</div></CardContent></Card>
    </div>
  </div>
}

function Clinica({clinica,setClinica,addLog}:Any){
  const [form,setForm]=useState(clinica);
  return <div className="space-y-6"><PageTitle title="Cadastro da Clínica" subtitle="Dados institucionais, unidades, tema visual e identidade do SaaS."><Button variant="teal" onClick={()=>{setClinica(form);addLog("Cadastro da clínica atualizado.")}}><Save className="h-4 w-4"/> Salvar clínica</Button></PageTitle>
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2"><CardContent><div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome fantasia"><Input value={form.nomeFantasia} onChange={e=>setForm({...form,nomeFantasia:e.target.value})}/></Field>
        <Field label="Razão social"><Input value={form.razaoSocial} onChange={e=>setForm({...form,razaoSocial:e.target.value})}/></Field>
        <Field label="Telefone"><Input value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})}/></Field>
        <Field label="Cidade"><Input value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})}/></Field>
        <Field label="UF"><Input value={form.uf} onChange={e=>setForm({...form,uf:e.target.value})}/></Field>
        <Field label="Endereço"><Input value={form.endereco} onChange={e=>setForm({...form,endereco:e.target.value})}/></Field>
        <div className="md:col-span-2"><Field label="Descrição"><Textarea value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/></Field></div>
      </div></CardContent></Card>
      <Card className="paddi-gradient"><CardContent><LogoPreview clinica={form}/></CardContent></Card>
    </div>
  </div>
}

function LogoPreview({clinica}:Any){
  return <div className="rounded-3xl bg-paddi-navy p-6 text-white"><Logo/><div className="mt-8"><p className="text-sm text-white/60">{clinica.razaoSocial}</p><p className="mt-2 text-lg font-black">{clinica.endereco}</p><p className="text-sm text-white/70">{clinica.cidade}/{clinica.uf} • {clinica.telefone}</p></div></div>
}

function Pacientes({patients,setPatients,allPatients,addLog}:Any){
  const [q,setQ]=useState("");
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({nome:"",telefone:"",cpf:"",convenio:"Particular",responsavel:"",status:"Ativo"});
  const rows = patients.filter((p:Any)=>JSON.stringify(p).toLowerCase().includes(q.toLowerCase())).slice(0,80);
  async function save(){
    if(!form.nome.trim()) return;
    const local = {...form,id:Date.now(),origem:"Cadastro manual"};
    setPatients([local, ...patients]);
    if (isSupabaseConfigured) {
      try {
        const saved = await insertSupabasePatient({ nome: form.nome, telefone: form.telefone, cpf: form.cpf, convenio: form.convenio, responsavel: form.responsavel, status: form.status, origem: "Cadastro manual" });
        setPatients((prev:any[]) => [saved, ...prev.filter((x:any)=>x.id!==local.id)]);
        addLog("Paciente salvo no Supabase.");
      } catch (e:any) { addLog("Paciente salvo localmente, mas falhou no Supabase: " + e.message); }
    } else {
      addLog("Paciente cadastrado localmente. Configure Supabase para persistir.");
    }
    setForm({nome:"",telefone:"",cpf:"",convenio:"Particular",responsavel:"",status:"Ativo"});
    setModal(false);
  }
  return <div className="space-y-6"><PageTitle title="Pacientes e Responsáveis" subtitle={`Base real: ${allPatients.length} pacientes importados. Cadastro funcional com busca e inclusão.`}><Button variant="teal" onClick={()=>setModal(true)}><UserPlus className="h-4 w-4"/> Novo paciente</Button></PageTitle>
    <Card><CardContent><div className="mb-4 flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><Input className="pl-9" value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nome, telefone, CPF, convênio..." /></div><Button variant="outline"><Filter className="h-4 w-4"/> Filtros</Button></div>
      <div className="space-y-2">{rows.map((p:Any)=><div key={p.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto] md:items-center">
        <div><b>{p.nome}</b><p className="text-xs text-slate-500">Origem: {p.origem || "Excel"}</p></div><span className="text-sm">{p.telefone || "Sem telefone"}</span><span className="text-sm">{p.cpf || "CPF não informado"}</span><span className="text-sm">{p.convenio || "Sem convênio"}</span><Badge tone={p.status==="Ativo"?"success":"warning"}>{p.status}</Badge>
      </div>)}</div></CardContent></Card>
    {modal && <Modal title="Novo paciente" onClose={()=>setModal(false)}><div className="grid gap-4 md:grid-cols-2">
      <Field label="Nome do paciente"><Input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></Field>
      <Field label="Responsável"><Input value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})}/></Field>
      <Field label="Telefone"><Input value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})}/></Field>
      <Field label="CPF"><Input value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value})}/></Field>
      <Field label="Convênio"><Input value={form.convenio} onChange={e=>setForm({...form,convenio:e.target.value})}/></Field>
      <Field label="Status"><Select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Ativo</option><option>Prospect</option><option>Inativo</option></Select></Field>
      <div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline" onClick={()=>setModal(false)}>Cancelar</Button><Button variant="teal" onClick={save}>Salvar paciente</Button></div>
    </div></Modal>}
  </div>
}

function AgendaRows({rows,compact,onAttend}:Any){
  return <div className="space-y-2">{rows.map((a:Any)=><div key={a.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white/75 p-4 lg:grid-cols-[110px_1.3fr_1fr_1fr_1fr_auto] lg:items-center">
    <div><b>{a.horario || "--:--"}</b><p className="text-xs text-slate-500">{a.data}</p></div>
    <div><b>{a.paciente}</b><p className="text-xs text-slate-500">{a.contato}</p></div>
    <div><p className="text-sm font-semibold">{a.profissional || "Sem profissional"}</p><p className="text-xs text-slate-500">{a.especialidade}</p></div>
    <div><p className="text-sm">{a.convenio || "Particular"}</p><p className="text-xs text-slate-500">Guia: {a.numeroGuia || "—"}</p></div>
    <div><p className="text-sm">{a.procedimentos || a.tipoAgendamento || "Atendimento"}</p><p className="text-xs text-slate-500">{a.sala}</p></div>
    <div className="flex flex-wrap gap-2"><Badge tone={String(a.status).toLowerCase().includes("final")?"success":"warning"}>{a.status || "Sem status"}</Badge><Badge tone={a.tiss==="Sem guia"?"danger":"info"}>{a.tiss}</Badge>{!compact && <Button size="sm" variant="teal" onClick={()=>onAttend?.(a.id)}>Finalizar</Button>}</div>
  </div>)}</div>
}

function Agenda({agenda,setAgenda,allAgenda,addLog}:Any){
  const [q,setQ]=useState("");
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({paciente:"",data:"2026-05-10",horario:"08:00",profissional:"",especialidade:"Fonoaudiologia",convenio:"Particular",numeroGuia:"",procedimentos:"Avaliação Inicial",status:"Agendado",sala:"Sala 01"});
  const rows = agenda.filter((a:Any)=>JSON.stringify(a).toLowerCase().includes(q.toLowerCase())).slice(0,120);
  async function save(){
    if(!form.paciente) return;
    const local = {...form,id:Date.now(),financeiro:"Previsão",tiss:form.numeroGuia?"Aguardando atendimento":"Não se aplica"};
    setAgenda([local, ...agenda]);
    if (isSupabaseConfigured) {
      try {
        const saved = await insertSupabaseSchedule(local);
        setAgenda((prev:any[]) => [saved, ...prev.filter((x:any)=>x.id!==local.id)]);
        addLog("Agendamento salvo no Supabase com previsão financeira.");
      } catch (e:any) { addLog("Agendamento local criado, mas falhou no Supabase: " + e.message); }
    } else {
      addLog("Agendamento criado localmente. Configure Supabase para persistir.");
    }
    setModal(false);
  }
  async function attend(id:number){
    const current = agenda.find((a:Any)=>a.id===id);
    const patch = {status:"Finalizado",financeiro:"Aberto",tiss:current?.numeroGuia?"Pronto TISS":"Não se aplica"};
    setAgenda(agenda.map((a:Any)=>a.id===id ? {...a,...patch} : a));
    if (isSupabaseConfigured) {
      try { await updateSupabaseSchedule(id, patch); addLog("Atendimento finalizado e atualizado no Supabase."); }
      catch(e:any){ addLog("Atendimento finalizado localmente, mas falhou no Supabase: " + e.message); }
    } else addLog("Atendimento finalizado localmente: financeiro aberto e TISS atualizado.");
  }
  return <div className="space-y-6"><PageTitle title="Agenda Profissional" subtitle={`Base real: ${allAgenda.length} agendamentos importados. Criação e finalização funcionais.`}><Button variant="teal" onClick={()=>setModal(true)}><Plus className="h-4 w-4"/> Novo agendamento</Button></PageTitle>
    <Card><CardContent><div className="mb-4 flex gap-2"><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar agenda por paciente, guia, profissional, status..." /><Button variant="outline"><Filter className="h-4 w-4"/> Filtros</Button></div><AgendaRows rows={rows} onAttend={attend}/></CardContent></Card>
    {modal && <Modal title="Novo agendamento" onClose={()=>setModal(false)}><div className="grid gap-4 md:grid-cols-2">
      {Object.entries(form).map(([k,v])=><Field key={k} label={k}><Input value={String(v)} onChange={e=>setForm({...form,[k]:e.target.value})}/></Field>)}
      <div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline" onClick={()=>setModal(false)}>Cancelar</Button><Button variant="teal" onClick={save}>Salvar agendamento</Button></div>
    </div></Modal>}
  </div>
}

function Sessao({addLog}:Any){
  const [note,setNote]=useState("");
  function ai(){setNote("Resumo IA: paciente participou da atividade com bom engajamento, necessitou apoio moderado para transição e apresentou avanço em comunicação funcional. Orientação à família: manter rotina visual e registrar episódios no diário."); addLog("IA simulada gerou resumo clínico aguardando aprovação.");}
  return <div className="space-y-6"><PageTitle title="Sessão Clínica" subtitle="Evolução, foto, áudio, IA, assinatura e resumo para pais."><Button variant="teal" onClick={ai}><Bot className="h-4 w-4"/> Gerar resumo IA</Button></PageTitle>
    <div className="grid gap-4 lg:grid-cols-2"><Card><CardContent><Field label="Evolução clínica"><Textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Registrar evolução da sessão..." /></Field><div className="mt-4 flex flex-wrap gap-2"><Button variant="outline"><Mic className="h-4 w-4"/> Gravar áudio</Button><Button variant="outline"><Camera className="h-4 w-4"/> Foto</Button><Button variant="teal" onClick={()=>addLog("Sessão assinada pelo profissional.")}><Save className="h-4 w-4"/> Assinar</Button></div></CardContent></Card><Card><CardContent><h2 className="font-black">Resumo para responsáveis</h2><div className="mt-3 rounded-2xl bg-teal-50 p-4 text-sm text-teal-900">{note || "Resumo ainda não aprovado."}</div><Button className="mt-4" variant="teal" onClick={()=>addLog("Resumo publicado no portal dos pais.")}><Send className="h-4 w-4"/> Publicar no portal</Button></CardContent></Card></div>
  </div>
}

function Whatsapp({addLog}:Any){
  const [leads,setLeads]=useState([{id:1,nome:"Maria / mãe do João", telefone:"47 90000-1000", intencao:"Agendar avaliação", especialidade:"Fonoaudiologia", status:"Triagem IA"},{id:2,nome:"Paulo Henrique",telefone:"47 90000-2000",intencao:"Plano de saúde",especialidade:"Psicologia",status:"Secretaria"},{id:3,nome:"Luciana",telefone:"47 90000-3000",intencao:"Paciente novo TEA",especialidade:"Terapia Ocupacional",status:"Fila de espera"}]);
  function convert(id:number){setLeads(leads.map(l=>l.id===id?{...l,status:"Convertido em prospect"}:l)); addLog("Lead do WhatsApp convertido em prospect.");}
  return <div className="space-y-6"><PageTitle title="WhatsApp / CRM" subtitle="Fila, triagem IA, roteiros, conversão em prospect e agendamento."><Button variant="teal" onClick={()=>addLog("Roteiro IA disparado para novo contato.")}><Bot className="h-4 w-4"/> Testar roteiro</Button></PageTitle>
    <div className="grid gap-4 lg:grid-cols-3">{leads.map(l=><Card key={l.id}><CardContent><div className="flex justify-between"><MessageCircle className="text-paddi-teal"/><Badge tone="teal">{l.status}</Badge></div><h3 className="mt-4 font-black">{l.nome}</h3><p className="text-sm text-slate-500">{l.telefone}</p><p className="mt-3 text-sm"><b>Intenção:</b> {l.intencao}</p><p className="text-sm"><b>Especialidade:</b> {l.especialidade}</p><Button className="mt-4" variant="teal" onClick={()=>convert(l.id)}>Converter</Button></CardContent></Card>)}</div>
  </div>
}

function Portal({addLog}:Any){
  return <div className="space-y-6"><PageTitle title="Portal dos Pais" subtitle="Timeline, fotos, relatórios, diário, chat e financeiro familiar." />
    <div className="grid gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardContent><h2 className="font-black">Timeline do paciente</h2>{["Sessão finalizada com resumo aprovado","Foto compartilhada com consentimento","Diário familiar recebido","Cobrança PIX disponível"].map(x=><div key={x} className="mt-3 rounded-2xl border border-slate-200 bg-white/70 p-4"><b>{x}</b><p className="text-sm text-slate-500">Visibilidade controlada por LGPD.</p></div>)}</CardContent></Card><Card><CardContent><Field label="Diário dos pais"><Textarea placeholder="Comportamento observado em casa..." /></Field><Button className="mt-3" variant="teal" onClick={()=>addLog("Diário dos pais enviado para equipe clínica.")}>Enviar diário</Button></CardContent></Card></div>
  </div>
}

function Guias({guides,setGuides,addLog}:Any){
  async function consume(id:number){
    const guide = guides.find((g:Any)=>g.id===id);
    const patch = {usadas:Math.min((guide?.usadas||0)+1,guide?.autorizadas||10),status:(guide?.usadas||0)+1>=(guide?.autorizadas||10)?"Esgotada":"Em uso"};
    setGuides(guides.map((g:Any)=>g.id===id?{...g,...patch}:g));
    if (isSupabaseConfigured) {
      try { await updateSupabaseGuide(id, patch); addLog("Guia consumida e atualizada no Supabase."); }
      catch(e:any){ addLog("Guia consumida localmente, mas falhou no Supabase: "+e.message); }
    } else addLog("Guia consumida localmente para teste.");
  }
  return <div className="space-y-6"><PageTitle title="Guias / TISS" subtitle="Nº guia, senha, validade, procedimento, sessões usadas e lote TISS."><Button variant="teal" onClick={()=>addLog("Lote TISS simulado gerado.")}><FileCheck2 className="h-4 w-4"/> Gerar lote TISS</Button></PageTitle>
    <Card><CardContent><div className="space-y-2">{guides.slice(0,120).map((g:Any)=><div key={g.id} className="rounded-2xl border border-slate-200 bg-white/75 p-4"><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><b>{g.paciente}</b><p className="text-xs text-slate-500">{g.convenio} • Guia {g.numeroGuia} • Senha {g.senha || "—"} • Vence {g.vencimento || "—"}</p></div><div className="flex gap-2"><Badge tone={g.status==="Esgotada"?"warning":"teal"}>{g.status}</Badge><Button size="sm" onClick={()=>consume(g.id)}>Consumir</Button></div></div><div className="mt-3"><Progress value={(g.usadas/g.autorizadas)*100}/><p className="mt-1 text-xs text-slate-500">{g.usadas}/{g.autorizadas} sessões</p></div></div>)}</div></CardContent></Card>
  </div>
}

function Financeiro({addLog}:Any){
  return <div className="space-y-6"><PageTitle title="Financeiro" subtitle="Previsão, contas a receber, fechamento paciente, convênio, profissional e conciliação."><Button variant="teal" onClick={()=>addLog("Conciliação por extrato simulada.")}><Database className="h-4 w-4"/> Conciliar</Button></PageTitle>
    <div className="grid gap-4 md:grid-cols-4">{[["Particular aberto","R$ 18.420,00"],["Convênio TISS","R$ 76.950,00"],["Repasse profissional","R$ 42.300,00"],["Glosas","R$ 9.860,00"]].map(([a,b])=><Stat key={a} label={a} value={b} detail="simulado" icon={Wallet}/>)}</div>
    <Card><CardContent><h2 className="font-black">Fechamento por paciente</h2>{["João da Silva","Ana Clara","Pedro Lucas"].map((p,i)=><div key={p} className="mt-3 grid gap-2 rounded-2xl border p-4 md:grid-cols-4 md:items-center"><b>{p}</b><span>Sessões: {i+3}</span><span>Aberto: R$ {(i+1)*180},00</span><Button size="sm" variant="teal" onClick={()=>addLog("Fechamento do paciente gerado.")}>Fechar</Button></div>)}</CardContent></Card>
  </div>
}

function Glosas({addLog}:Any){
  const [rows,setRows]=useState([{id:1,paciente:"Ana Clara",convenio:"Unimed",guia:"882100",motivo:"Autorização vencida",valor:320,status:"Aberta"},{id:2,paciente:"Pedro Lucas",convenio:"Bradesco",guia:"773912",motivo:"Código TUSS divergente",valor:180,status:"Em análise"}]);
  function appeal(id:number){setRows(rows.map(r=>r.id===id?{...r,status:"Recurso enviado"}:r)); addLog("Recurso de glosa enviado.");}
  return <div className="space-y-6"><PageTitle title="Glosas" subtitle="Painel para analisar, recorrer, reprocessar e recuperar valores." />
    <Card><CardContent>{rows.map(r=><div key={r.id} className="mt-3 grid gap-2 rounded-2xl border p-4 md:grid-cols-6 md:items-center"><b>{r.paciente}</b><span>{r.convenio}</span><span>{r.guia}</span><span>{r.motivo}</span><span>R$ {r.valor},00</span><Button size="sm" variant="teal" onClick={()=>appeal(r.id)}>Recorrer</Button></div>)}</CardContent></Card>
  </div>
}

function Fiscal({addLog}:Any){
  return <div className="space-y-6"><PageTitle title="NFS-e / DMED" subtitle="Emissão de notas, exportação DMED e conferência fiscal."><Button variant="teal" onClick={()=>addLog("DMED simulado exportado.")}><Download className="h-4 w-4"/> Exportar DMED</Button></PageTitle>
    <div className="grid gap-4 md:grid-cols-3"><Stat label="NFS-e emitidas" value="128" detail="mês atual" icon={Receipt}/><Stat label="DMED" value="2026" detail="ano-base" icon={FileText}/><Stat label="Pendências fiscais" value="0" detail="QA fiscal" icon={CheckCircle2}/></div>
    <Card><CardContent><Button variant="teal" onClick={()=>addLog("NFS-e simulada emitida.")}>Emitir NFS-e de teste</Button></CardContent></Card>
  </div>
}

function Profissionais({professionals}:Any){
  return <div className="space-y-6"><PageTitle title="Profissionais" subtitle="Produtividade, agenda, atendimentos, capacidade e repasse." />
    <Card><CardContent>{professionals.map((p:Any)=><div key={p.id} className="mt-3 rounded-2xl border p-4"><div className="flex flex-col justify-between gap-2 md:flex-row"><div><b>{p.nome}</b><p className="text-sm text-slate-500">Agendamentos importados: {p.agendamentos}</p></div><Badge tone={p.produtividade>45?"success":p.produtividade>25?"warning":"danger"}>{p.produtividade}%</Badge></div><div className="mt-3"><Progress value={p.produtividade}/></div></div>)}</CardContent></Card>
  </div>
}

function Importacao({addLog}:Any){
  const qa = seed.meta.qa as Any;
  const items = [["Pacientes importados",qa.pacientesCadastro,"success"],["Agendamentos importados",qa.agendamentos,"success"],["Pacientes agenda sem cadastro",qa.pacientesAgendaNaoEncontradosCadastroAprox,"danger"],["Nomes duplicados",qa.nomesDuplicados,"warning"],["Telefones duplicados",qa.telefonesDuplicados,"warning"],["Guias identificadas",qa.guias,"success"]];
  return <div className="space-y-6"><PageTitle title="Importação / QA" subtitle="Análise de qualidade dos dados reais antes de materializar no banco final."><Button variant="teal" onClick={()=>addLog("QA de importação executado.")}><RefreshCw className="h-4 w-4"/> Rodar validação</Button></PageTitle>
    <Card><CardContent><div className="grid gap-3 md:grid-cols-2">{items.map(([a,b,t]:Any)=><div key={a} className="flex items-center justify-between rounded-2xl border p-4"><b>{a}</b><Badge tone={t}>{b}</Badge></div>)}</div></CardContent></Card>
  </div>
}

function Seguranca(){
  return <div className="space-y-6"><PageTitle title="LGPD / Segurança" subtitle="Perfis, permissões, consentimentos, auditoria, prontuário e mídia." />
    <div className="grid gap-4 md:grid-cols-3"><Card><CardContent><Lock/><h2 className="mt-3 font-black">Permissões</h2><p className="text-sm text-slate-500">Admin, secretaria, profissional, financeiro, responsável.</p></CardContent></Card><Card><CardContent><ShieldCheck/><h2 className="mt-3 font-black">Consentimentos</h2><p className="text-sm text-slate-500">Imagem, gravação, WhatsApp, portal e dados sensíveis.</p></CardContent></Card><Card><CardContent><Database/><h2 className="mt-3 font-black">Auditoria</h2><p className="text-sm text-slate-500">Log de acesso e alterações críticas.</p></CardContent></Card></div>
  </div>
}

function Config({theme,setTheme,addLog}:Any){
  return <div className="space-y-6"><PageTitle title="Configurações" subtitle="Tema, integrações, planos SaaS, WhatsApp, IA, TISS e fiscal."><Button variant="teal" onClick={()=>addLog("Configurações salvas.")}><Save className="h-4 w-4"/> Salvar</Button></PageTitle>
    <Card><CardContent><div className="grid gap-4 md:grid-cols-2"><Field label="Tema"><Select value={theme} onChange={e=>setTheme(e.target.value)}><option value="paddi">PADDI premium</option><option value="clinical">Clínico clean</option><option value="kids">Infantil suave</option></Select></Field><Field label="Plano SaaS"><Select><option>Premium: IA + WhatsApp + TISS + Fiscal</option><option>Profissional</option><option>Básico</option></Select></Field><Field label="WhatsApp Provider"><Input placeholder="Meta / 360dialog / Z-API"/></Field><Field label="Token IA"><Input type="password" placeholder="sk-..."/></Field></div></CardContent></Card>
  </div>
}

export default App;
