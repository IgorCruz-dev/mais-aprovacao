"use client"

import Link from "next/link"
import {
  Radio, Users, Clock, CalendarBlank, Plus, Play, ArrowRight,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, NavyCard, SectionTitle, Avatar,
  PageHeader, KpiCard, RevealGroup, RevealItem,
} from "@/components/teacher/TeacherSurface"
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

// ─── Ao vivo ─────────────────────────────────────────────────────────────────

function LiveSessionCard({ aulao }: { aulao: Aulao }) {
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(aulao.scheduledAt).getTime()) / 60000))
  const viewersPct = Math.round(((aulao.viewersNow ?? 0) / aulao.enrolledCount) * 100)
  return (
    <NavyCard halftone="blue" watermark={<Radio size={130} />} className="p-5 lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: APROVA.error }} />
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white"
              style={{ background: APROVA.error }}
            >
              Ao vivo
            </span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {elapsed > 0 ? `há ${elapsed} min` : "iniciou agora"}
            </span>
          </div>
          <h2 className="font-display text-[20px] font-bold text-white lg:text-[25px]">{aulao.title}</h2>
          <p className="mt-1 text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            {aulao.teacherName} · {aulao.turmas.join(", ")}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users size={13} weight="fill" color="rgba(255,255,255,0.45)" />
              <span className="text-[13px] font-bold tabular text-white">{aulao.viewersNow}</span>
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>/ {aulao.enrolledCount} ({viewersPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} weight="fill" color="rgba(255,255,255,0.45)" />
              <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>{aulao.durationMin} min</span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <Link
            href={`/teacher/auloes/${aulao.id}`}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full px-7 text-[14px] font-extrabold text-white transition-transform hover:scale-[1.03]"
            style={{ background: APROVA.error }}
          >
            <Radio size={16} weight="fill" /> Entrar na sala <ArrowRight size={15} weight="bold" />
          </Link>
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
        <div className="flex shrink-0 items-center gap-1 text-right">
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

// ─── Histórico ───────────────────────────────────────────────────────────────

function HistoryRow({ aulao, isLast }: { aulao: Aulao; isLast: boolean }) {
  const d = new Date(aulao.scheduledAt)
  const pct = aulao.attendancePct ?? 0
  const pctColor = pct >= 85 ? APROVA.success : pct >= 65 ? "#D97706" : APROVA.error
  return (
    <div
      className="flex items-center gap-4 py-3.5"
      style={{ borderBottom: isLast ? undefined : `1px solid #F1F3F8` }}
    >
      <div
        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl"
        style={{ background: APROVA.blueSoft }}
      >
        <span className="text-[14px] font-bold tabular leading-none" style={{ color: APROVA.blue }}>
          {d.getDate().toString().padStart(2, "0")}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: APROVA.blue }}>
          {d.toLocaleDateString("pt-BR", { month: "short" })}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-bold" style={{ color: APROVA.ink }}>{aulao.title}</p>
        <p className="text-[11.5px]" style={{ color: APROVA.inkMuted }}>
          {aulao.teacherName} · {aulao.turmas.join(", ")}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[14px] font-bold tabular" style={{ color: pctColor }}>{pct}%</p>
        <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>
          {aulao.attendanceCount}/{aulao.enrolledCount} presentes
        </p>
      </div>
      {aulao.recordingUrl && (
        <Link
          href={aulao.recordingUrl}
          className="ml-1 inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold transition-opacity hover:opacity-70"
          style={{ background: APROVA.blueSoft, color: APROVA.blue }}
        >
          <Play size={12} weight="fill" /> Gravação
        </Link>
      )}
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function TeacherAuloesPage() {
  const live     = AULOES.find((a) => a.status === "ao_vivo") ?? null
  const upcoming = AULOES.filter((a) => a.status === "agendado")
  const history  = AULOES.filter((a) => a.status === "encerrado")

  const totalMonth   = AULOES.filter((a) => a.status !== "agendado").length
  const avgAttendance = Math.round(
    history.reduce((s, a) => s + (a.attendancePct ?? 0), 0) / Math.max(history.length, 1)
  )

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          title="Aulões"
          kicker="Transmissões ao vivo"
          subtitle="Gerencie sessões ao vivo, programe novos aulões e acesse gravações anteriores."
          action={
            <button
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-[13px] font-extrabold text-white transition-transform hover:scale-[1.02]"
              style={{ background: APROVA.blue }}
            >
              <Plus size={16} weight="bold" /> Agendar aulão
            </button>
          }
        />
      </RevealItem>

      {/* KPIs */}
      <RevealItem>
        <div className="mb-6 grid grid-cols-3 gap-3 lg:gap-4">
          <KpiCard label="Realizados este mês" value={totalMonth} icon={Radio}       color={APROVA.blue}    />
          <KpiCard label="Média de presença"   value={avgAttendance} unit="%" icon={Users}  color={APROVA.success} />
          <KpiCard label="Agendados"           value={upcoming.length} icon={CalendarBlank} color={APROVA.gold}    />
        </div>
      </RevealItem>

      {/* Ao vivo agora */}
      {live && (
        <RevealItem className="mb-6">
          <SectionTitle title="Ao vivo agora" kicker="Acontecendo" />
          <div className="mt-3">
            <LiveSessionCard aulao={live} />
          </div>
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

      {/* Histórico */}
      {history.length > 0 && (
        <RevealItem>
          <SectionTitle
            title="Histórico"
            kicker={`${history.length} sessões`}
          />
          <BentoCard className="mt-3">
            {history.map((a, i) => (
              <HistoryRow key={a.id} aulao={a} isLast={i === history.length - 1} />
            ))}
          </BentoCard>
        </RevealItem>
      )}
    </RevealGroup>
  )
}
