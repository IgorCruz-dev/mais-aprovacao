"use client"

import { useState } from "react"
import {
  User, CreditCard, Target, Clock, Lock, Sliders, Check,
  Camera, ArrowRight, SignOut,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  APROVA, MODULES, BentoCard, PageHeader, GoldButton, Avatar,
} from "@/components/student/StudentSurface"
import { STUDENT, PROFILE, PROFILE_SECTIONS } from "@/lib/mock-data"

const SECTION_ICONS: Record<string, PhosphorIcon> = {
  user: User, card: CreditCard, target: Target, clock: Clock, lock: Lock, sliders: Sliders,
}

type SectionKey = (typeof PROFILE_SECTIONS)[number]["key"]

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{label}</label>
      <input defaultValue={value} className="w-full rounded-xl border border-[#E6E9F0] bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#1B4DE4]" style={{ color: APROVA.ink }} />
    </div>
  )
}

function IdentitySection() {
  const [bio, setBio] = useState(PROFILE.bio)
  const [pub, setPub] = useState(PROFILE.publicProfile)
  return (
    <div className="flex flex-col gap-5">
      {/* avatar */}
      <div className="flex items-center gap-4">
        <Avatar initial={STUDENT.initial} color={APROVA.blue} size={64} ring={APROVA.gold} />
        <button className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E9F0] px-3.5 py-2 text-[12px] font-bold" style={{ color: APROVA.ink }}>
          <Camera size={15} weight="fill" /> Alterar avatar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome completo" value={PROFILE.fullName} />
        <Field label="Nome de usuário" value={PROFILE.username} />
        <Field label="Data de nascimento" value={PROFILE.birthDate} />
        <Field label="WhatsApp / Telefone" value={PROFILE.phone} />
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Biografia</label>
        <textarea value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-[#E6E9F0] bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#1B4DE4]" style={{ color: APROVA.ink }} />
        <p className="mt-1 text-right text-[11px]" style={{ color: "#9AA1B0" }}>{bio.length}/160</p>
      </div>

      <Field label="Necessidade de acessibilidade" value={PROFILE.accessibility} />

      {/* toggle perfil público */}
      <div className="flex items-start justify-between gap-4 rounded-2xl bg-[#F6F7FB] p-4">
        <div className="min-w-0">
          <p className="text-[13.5px] font-extrabold" style={{ color: APROVA.ink }}>Perfil público</p>
          <p className="mt-0.5 text-[12px] leading-snug" style={{ color: APROVA.inkMuted }}>
            {pub ? "Seu nome e avatar aparecem no ranking da turma e no feed de atividades." : "Você aparece como \"Aluno anônimo\" no ranking. Ninguém vê seu nome ou avatar."}
          </p>
        </div>
        <button onClick={() => setPub((v) => !v)} className="relative shrink-0 rounded-full transition-colors" style={{ width: 46, height: 26, background: pub ? APROVA.blue : "#D8DCE6" }}>
          <span className="absolute top-1 rounded-full bg-white transition-all" style={{ width: 18, height: 18, left: pub ? 25 : 3 }} />
        </button>
      </div>

      <GoldButton className="self-start"><Check size={15} weight="bold" /> Salvar identidade</GoldButton>
    </div>
  )
}

function PlanSection() {
  const p = PROFILE.plan
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-5" style={{ background: `linear-gradient(120deg, ${APROVA.navy}, ${APROVA.navy2})` }}>
        <div className="flex items-center justify-between">
          <p className="font-display text-[17px] font-extrabold text-white">{p.name}</p>
          <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase" style={{ background: "rgba(15,169,104,0.2)", color: "#4ADE9A" }}>{p.status}</span>
        </div>
        <p className="mt-1 text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>Membro desde {p.since}</p>
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="font-display text-[30px] font-extrabold text-white">{p.price.split("/")[0]}</span>
          <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>/mês · próxima cobrança {p.nextCharge}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {["Banco ilimitado", "Simulados", "Videoaulas", "Redações (5/mês)", "Correção por IA", "Ranking mensal"].map((f) => (
          <div key={f} className="flex items-center gap-2 rounded-xl bg-[#F6F7FB] px-3 py-2.5">
            <Check size={14} weight="bold" color={APROVA.success} />
            <span className="text-[12.5px] font-medium" style={{ color: APROVA.ink }}>{f}</span>
          </div>
        ))}
      </div>
      <button className="inline-flex items-center gap-1.5 self-start text-[13px] font-bold" style={{ color: APROVA.blue }}>Gerenciar assinatura <ArrowRight size={13} weight="bold" /></button>
    </div>
  )
}

function JourneySection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Vestibulares-alvo</p>
        <div className="flex flex-wrap gap-2">
          {PROFILE.targetExams.map((e) => (
            <span key={e} className="rounded-full px-3.5 py-1.5 text-[12px] font-extrabold text-white" style={{ background: MODULES.simulados }}>{e}</span>
          ))}
          <button className="rounded-full border border-dashed border-[#C4CAD6] px-3.5 py-1.5 text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>+ Adicionar</button>
        </div>
      </div>
      <Field label="Curso pretendido" value="Medicina — UFU" />
    </div>
  )
}

function RoutineSection() {
  const r = PROFILE.studyRoutine
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[{ l: "Dias por semana", v: `${r.daysPerWeek} dias` }, { l: "Melhor horário", v: r.preferredTime }, { l: "Meta semanal", v: `${r.weeklyGoalHours}h` }].map((x) => (
        <BentoCard key={x.l} className="p-4 text-center">
          <p className="font-display text-[24px] font-extrabold" style={{ color: APROVA.blue }}>{x.v}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>{x.l}</p>
        </BentoCard>
      ))}
    </div>
  )
}

function SimpleLinks({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col">
      {items.map((l, i) => (
        <button key={l} className="flex items-center justify-between py-3.5 text-left" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
          <span className="text-[13.5px] font-semibold" style={{ color: APROVA.ink }}>{l}</span>
          <ArrowRight size={15} color="#C4CAD6" />
        </button>
      ))}
    </div>
  )
}

export default function PerfilPage() {
  const [section, setSection] = useState<SectionKey>("identidade")
  return (
    <div className="mx-auto max-w-[1080px] px-4 pt-5 lg:px-8 lg:pt-7">
      <PageHeader
        title="Meu Perfil"
        kicker="Conta e preferências"
        action={<span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: APROVA.blueSoft, color: APROVA.blue }}>Conta de aluno · ativa</span>}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr]">
        {/* sidebar de seções */}
        <BentoCard className="h-fit p-2">
          {PROFILE_SECTIONS.map((s) => {
            const Icon = SECTION_ICONS[s.icon] ?? User
            const active = section === s.key
            return (
              <button key={s.key} onClick={() => setSection(s.key)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors" style={{ background: active ? APROVA.blueSoft : "transparent" }}>
                <Icon size={18} weight={active ? "fill" : "regular"} color={active ? APROVA.blue : APROVA.inkMuted} />
                <span className="text-[13px]" style={{ color: active ? APROVA.blue : APROVA.ink, fontWeight: active ? 800 : 600 }}>{s.label}</span>
              </button>
            )
          })}
          <div className="mt-1 border-t pt-1" style={{ borderColor: "#F1F3F8" }}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left" style={{ color: APROVA.error }}>
              <SignOut size={18} weight="bold" /> <span className="text-[13px] font-bold">Sair da conta</span>
            </button>
          </div>
        </BentoCard>

        {/* conteúdo */}
        <BentoCard>
          <h2 className="mb-5 font-display text-[18px] font-extrabold" style={{ color: APROVA.ink }}>
            {PROFILE_SECTIONS.find((s) => s.key === section)?.label}
          </h2>
          {section === "identidade" && <IdentitySection />}
          {section === "plano" && <PlanSection />}
          {section === "jornada" && <JourneySection />}
          {section === "rotina" && <RoutineSection />}
          {section === "seguranca" && <SimpleLinks items={["Alterar senha", "Autenticação em duas etapas", "Dispositivos conectados", "Sessões ativas"]} />}
          {section === "preferencias" && <SimpleLinks items={["Notificações por e-mail", "Notificações push", "Lembretes de estudo", "Idioma da interface", "Termos de uso", "Política de privacidade"]} />}
        </BentoCard>
      </div>
    </div>
  )
}
