"use client"

import Link from "next/link"
import {
  Radio, Users, Clock, CalendarBlank, Play, ArrowRight, ChalkboardTeacher,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, NavyCard, SectionTitle, Avatar,
  PageHeader, RevealGroup, RevealItem,
} from "@/components/student/StudentSurface"
import { AULOES, type Aulao } from "@/lib/mock-teacher-data"

const SUBJECT_COLORS: Record<string, string> = {
  Redação:    APROVA.blue,
  Português:  "#6C4BD9",
  Matemática: APROVA.success,
  Biologia:   "#0D9488",
  Química:    "#D97706",
  Física:     "#DB2777",
}

function subjectColor(s: string) { return SUBJECT_COLORS[s] ?? APROVA.inkMuted }

function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}
function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}
function fmtWeekday(dt: string) {
  return new Date(dt).toLocaleDateString("pt-BR", { weekday: "long" })
}

// ─── Hero ao vivo ─────────────────────────────────────────────────────────────

function LiveHero({ aulao }: { aulao: Aulao }) {
  const viewersPct = Math.round(((aulao.viewersNow ?? 0) / aulao.enrolledCount) * 100)
  return (
    <NavyCard
      halftone="blue"
      watermark={<Radio size={140} />}
      className="mb-6 overflow-hidden p-5 lg:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
        <div className="min-w-0 flex-1">
          {/* live badge */}
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: APROVA.error }} />
            </span>
            <span
              className="rounded-full px-3 py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-white"
              style={{ background: APROVA.error }}
            >
              Ao vivo agora
            </span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {aulao.viewersNow} pessoas assistindo
            </span>
          </div>

          <h2 className="font-display text-[22px] font-bold text-white lg:text-[28px]">{aulao.title}</h2>
          <p className="mt-1.5 text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>
            {aulao.turmas.join(", ")}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Avatar initial={aulao.teacherInitial} color={aulao.teacherColor} size={32} />
            <div>
              <p className="text-[12.5px] font-bold text-white">{aulao.teacherName}</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                {aulao.viewersNow}/{aulao.enrolledCount} participantes · {viewersPct}% da turma
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href={`/student/auloes/${aulao.id}`}
            className="inline-flex min-h-[52px] items-center gap-2.5 rounded-full px-8 text-[15px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.04]"
            style={{ background: APROVA.error }}
          >
            <Radio size={18} weight="fill" /> Entrar ao vivo <ArrowRight size={16} weight="bold" />
          </Link>
          <p className="mt-2 text-center text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {aulao.durationMin} min · gratuito para alunos
          </p>
        </div>
      </div>
    </NavyCard>
  )
}

// ─── Agendado ────────────────────────────────────────────────────────────────

function UpcomingCard({ aulao }: { aulao: Aulao }) {
  const color = subjectColor(aulao.subject)
  return (
    <BentoCard hover>
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className="inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white"
          style={{ background: color }}
        >
          {aulao.subject}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <CalendarBlank size={11} weight="fill" color={APROVA.inkMuted} />
          <span className="text-[11px] font-semibold" style={{ color: APROVA.inkMuted }}>{fmtDate(aulao.scheduledAt)}</span>
        </div>
      </div>
      <h3 className="mb-1 font-display text-[15px] font-bold leading-snug" style={{ color: APROVA.ink }}>{aulao.title}</h3>
      <p className="mb-3 text-[11.5px]" style={{ color: APROVA.inkMuted }}>
        {fmtWeekday(aulao.scheduledAt)} às {fmtTime(aulao.scheduledAt)} · {aulao.durationMin} min
      </p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {aulao.turmas.map((t) => (
          <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: APROVA.blueSoft, color: APROVA.blue }}>{t}</span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "#F1F3F8" }}>
        <div className="flex items-center gap-1.5">
          <Avatar initial={aulao.teacherInitial} color={aulao.teacherColor} size={24} />
          <span className="text-[11.5px] font-semibold" style={{ color: APROVA.ink }}>{aulao.teacherName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={11} weight="fill" color={APROVA.inkMuted} />
          <span className="text-[11.5px]" style={{ color: APROVA.inkMuted }}>{aulao.enrolledCount} inscritos</span>
        </div>
      </div>
    </BentoCard>
  )
}

// ─── Gravação disponível ──────────────────────────────────────────────────────

function RecordingCard({ aulao }: { aulao: Aulao }) {
  const color = subjectColor(aulao.subject)
  const pct   = aulao.attendancePct ?? 0
  return (
    <BentoCard>
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide"
          style={{ background: color + "14", color }}
        >
          {aulao.subject}
        </span>
        <span className="text-[11px]" style={{ color: APROVA.inkMuted }}>{fmtDate(aulao.scheduledAt)}</span>
      </div>
      <h3 className="mb-1 text-[13.5px] font-bold leading-snug" style={{ color: APROVA.ink }}>{aulao.title}</h3>
      <p className="mb-3 text-[11px]" style={{ color: APROVA.inkMuted }}>
        {aulao.teacherName} · {aulao.durationMin} min · {pct}% de presença
      </p>
      <Link
        href={aulao.recordingUrl ?? "#"}
        className="inline-flex min-h-[36px] items-center gap-2 rounded-full px-4 text-[12px] font-bold transition-opacity hover:opacity-80"
        style={{ background: APROVA.blueSoft, color: APROVA.blue }}
      >
        <Play size={12} weight="fill" /> Assistir gravação
      </Link>
    </BentoCard>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function StudentAuloesPage() {
  const live      = AULOES.find((a) => a.status === "ao_vivo") ?? null
  const upcoming  = AULOES.filter((a) => a.status === "agendado")
  const recordings = AULOES.filter((a) => a.status === "encerrado" && a.recordingUrl)

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          title="Aulões ao Vivo"
          kicker="Transmissões"
          subtitle="Assista aos aulões em tempo real ou revise gravações das sessões anteriores."
        />
      </RevealItem>

      {/* Ao vivo agora */}
      {live && (
        <RevealItem>
          <LiveHero aulao={live} />
        </RevealItem>
      )}

      {/* Próximas sessões */}
      {upcoming.length > 0 && (
        <RevealItem className="mb-6">
          <SectionTitle
            title="Próximas sessões"
            kicker={`${upcoming.length} agendada${upcoming.length > 1 ? "s" : ""}`}
          />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {upcoming.map((a) => <UpcomingCard key={a.id} aulao={a} />)}
          </div>
        </RevealItem>
      )}

      {/* Gravações */}
      {recordings.length > 0 && (
        <RevealItem>
          <SectionTitle
            title="Gravações disponíveis"
            kicker={`${recordings.length} sessões`}
          />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {recordings.map((a) => <RecordingCard key={a.id} aulao={a} />)}
          </div>
        </RevealItem>
      )}

      {!live && upcoming.length === 0 && recordings.length === 0 && (
        <RevealItem>
          <BentoCard>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <ChalkboardTeacher size={40} weight="duotone" color={APROVA.inkMuted} />
              <p className="text-[14px] font-semibold" style={{ color: APROVA.inkMuted }}>Nenhum aulão disponível no momento.</p>
            </div>
          </BentoCard>
        </RevealItem>
      )}
    </RevealGroup>
  )
}
