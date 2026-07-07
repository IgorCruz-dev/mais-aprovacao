"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Fire, ShieldStar, Star, Trophy, VideoCamera, Play,
  Books, Exam, PencilLine, Warning,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  APROVA, MODULES, BentoCard, NavyCard, MilestoneBar,
  SectionTitle, ProgressBar, Avatar, Medal, useCountUp,
} from "@/components/student/StudentSurface"
import {
  STUDENT, CURRENT_LESSON, RACE, RACE_MILESTONES,
  RANKING_PODIUM, CLASS_ACTIVITY, EXAMS,
} from "@/lib/mock-data"

// ─── Saudação dinâmica ─────────────────────────────────────────────────────────

function useGreeting() {
  const [state, setState] = useState({ greeting: "Boa noite", atRisk: false })
  useEffect(() => {
    const h = new Date().getHours()
    const greeting = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"
    const activityToday = false // mock: ainda não estudou hoje
    setState({ greeting, atRisk: h >= 20 && !activityToday })
  }, [])
  return state
}

const ACTIVITY_ICON: Record<string, { icon: PhosphorIcon; color: string }> = {
  questoes: { icon: Books, color: MODULES.questoes },
  simulados: { icon: Exam, color: MODULES.simulados },
  redacoes: { icon: PencilLine, color: MODULES.redacoes },
  aulas: { icon: VideoCamera, color: MODULES.aulas },
  ranking: { icon: Trophy, color: APROVA.gold },
  streak: { icon: Fire, color: APROVA.streak },
}

// ─── Hero de saudação ──────────────────────────────────────────────────────────

function GreetingHero({ greeting, atRisk }: { greeting: string; atRisk: boolean }) {
  const points = useCountUp(STUDENT.points)
  return (
    <NavyCard halftone="white" className="p-4 lg:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.5)" }}>{greeting},</p>
          <h1 className="font-display text-[40px] font-bold text-white lg:text-[52px]">{STUDENT.name.split(" ")[0]}!</h1>
          <p className="mt-1 font-script text-[26px] leading-none text-white lg:mt-2 lg:text-[30px]">
            Nós nascemos para <span style={{ color: APROVA.gold }}>conquistar</span>
          </p>
        </div>

        {/* pills + alerta integrado */}
        <div className="flex flex-col gap-2 lg:items-end lg:gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <HeroPill icon={Fire} color={APROVA.streak} value={`${STUDENT.streak}`} label="ofensiva" />
            <HeroPill icon={ShieldStar} color={APROVA.blueBright} value={`${STUDENT.shields}`} label="escudos" />
            <HeroPill icon={Star} color={APROVA.gold} value={points} label="pts" />
            <HeroPill icon={Trophy} color="#fff" value={`#${STUDENT.rank}`} label="rank" />
          </div>
          {atRisk && (
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "rgba(242,96,12,0.16)", border: "1px solid rgba(242,96,12,0.4)" }}>
              <Warning size={14} weight="fill" color={APROVA.streak} />
              <span className="text-[11.5px] font-semibold" style={{ color: "#FFD3B8" }}>Ofensiva em risco — estude 1 questão hoje.</span>
              <Link href="/questoes" className="text-[11.5px] font-extrabold" style={{ color: APROVA.gold }}>Estudar →</Link>
            </div>
          )}
        </div>
      </div>
    </NavyCard>
  )
}

function HeroPill({ icon: Icon, color, value, label }: { icon: PhosphorIcon; color: string; value: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <Icon size={16} weight="fill" color={color} />
      <span className="text-[14px] font-bold tabular text-white">{value}</span>
      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
    </div>
  )
}

// ─── Continue de onde parou ────────────────────────────────────────────────────

function ContinueCard() {
  return (
    <BentoCard hover>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide" style={{ background: APROVA.blueSoft, color: APROVA.blue }}>
            <VideoCamera size={12} weight="fill" /> Videoaula
          </span>
          <span className="text-[11px] font-semibold" style={{ color: APROVA.inkMuted }}>Continue de onde parou</span>
        </div>
        <h3 className="font-display text-[19px] font-bold" style={{ color: APROVA.ink }}>{CURRENT_LESSON.title}</h3>
        <p className="mt-1 text-[12px]" style={{ color: APROVA.inkMuted }}>
          Aula {CURRENT_LESSON.lesson} de {CURRENT_LESSON.totalLessons} · {CURRENT_LESSON.professor} · {CURRENT_LESSON.lastWatched}
        </p>
        <div className="mt-3"><ProgressBar pct={CURRENT_LESSON.progress} color={MODULES.aulas} height={7} /></div>
        <Link href="/aulas" className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-[13px] font-extrabold text-white transition-transform hover:scale-[1.01] sm:w-auto sm:px-6" style={{ background: MODULES.aulas }}>
          <Play size={14} weight="fill" /> Continuar assistindo
        </Link>
      </div>
    </BentoCard>
  )
}

// ─── Ações rápidas ─────────────────────────────────────────────────────────────

function QuickActions() {
  const actions = [
    { icon: Books, title: "Questões", subtitle: "Banco livre por matéria", color: MODULES.questoes, href: "/questoes" },
    { icon: Exam, title: "Simulado", subtitle: "Prova cronometrada", color: MODULES.simulados, href: "/simulados" },
    { icon: PencilLine, title: "Redação", subtitle: "Enviar e receber correção", color: MODULES.redacoes, href: "/redacoes" },
  ]
  return (
    <div className="grid grid-cols-3 gap-3 lg:gap-4">
      {actions.map(({ icon: Icon, title, subtitle, color, href }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col gap-2 rounded-[18px] p-3.5 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] lg:p-4"
          style={{ background: color }}
        >
          <Icon size={24} weight="fill" color="#fff" />
          <div>
            <p className="font-display text-[13px] font-bold text-white lg:text-[15px]">{title}</p>
            <p className="text-[10px] text-white/70 lg:text-[11px]">{subtitle}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── Feed da turma ─────────────────────────────────────────────────────────────

function ClassFeed() {
  return (
    <BentoCard>
      <SectionTitle title="Atividade da turma" kicker="Ao vivo" actionLabel="Ver tudo" />
      <div className="flex flex-col">
        {CLASS_ACTIVITY.map((item, i) => {
          const conf = ACTIVITY_ICON[item.icon] ?? { icon: Books, color: APROVA.blue }
          const Icon = conf.icon
          return (
            <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
              <div className="relative shrink-0">
                <Avatar initial={item.initial} color={item.color} size={38} />
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
                  <Icon size={12} weight="fill" color={conf.color} />
                </div>
              </div>
              <p className="min-w-0 flex-1 text-[12.5px] leading-snug" style={{ color: APROVA.ink }}>
                <span className="font-bold">{item.name}</span> {item.action}
              </p>
              <span className="shrink-0 text-[11px]" style={{ color: "#9AA1B0" }}>{item.time}</span>
            </div>
          )
        })}
      </div>
    </BentoCard>
  )
}

// ─── Sidebar: seu mês ──────────────────────────────────────────────────────────

function MonthSummary() {
  const rows = [
    { icon: Fire, label: "Ofensiva", value: `${STUDENT.streak} dias`, color: APROVA.streak },
    { icon: Star, label: "Pontos", value: `${STUDENT.points}`, color: APROVA.gold },
    { icon: Trophy, label: "Ranking", value: `#${STUDENT.rank}`, color: APROVA.blue },
  ]
  return (
    <BentoCard>
      <SectionTitle title="Seu mês" kicker="Julho 2026" />
      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2.5 py-1.5">
            <r.icon size={17} weight="fill" color={r.color} />
            <span className="flex-1 text-[12.5px]" style={{ color: APROVA.inkMuted }}>{r.label}</span>
            <span className="text-[14px] font-bold tabular" style={{ color: APROVA.ink }}>{r.value}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

// ─── Sidebar: corrida ──────────────────────────────────────────────────────────

function RaceCard() {
  const remaining = RACE.leaderPts - RACE.points
  return (
    <NavyCard halftone="gold">
      <div className="mb-1 flex items-center gap-2">
        <Trophy size={16} weight="fill" color={APROVA.gold} />
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: APROVA.gold }}>Corrida para aprovação</p>
      </div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="font-display text-[46px] font-bold tabular text-white">{RACE.points}</span>
        <span className="text-[13px] font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>/ {RACE.target.toLocaleString("pt-BR")} pts</span>
      </div>
      <MilestoneBar value={RACE.points} target={RACE.target} milestones={RACE_MILESTONES} />
      <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
        Faltam <span className="font-extrabold text-white">{remaining} pts</span> para o topo da turma.
      </p>
    </NavyCard>
  )
}

// ─── Sidebar: ranking da turma ─────────────────────────────────────────────────

function ClassRanking() {
  return (
    <BentoCard>
      <SectionTitle title="Ranking da turma" actionLabel="Ver ranking" onAction={() => {}} />
      <Link href="/ranking" className="block">
        <div className="flex flex-col gap-1.5">
          {RANKING_PODIUM.map((p) => (
            <div key={p.rank} className="flex items-center gap-3 rounded-xl px-2.5 py-2" style={{ background: p.rank === 1 ? "linear-gradient(90deg, #FFF7E0, #FFFDF6)" : "transparent", border: p.rank === 1 ? "1px solid #FDE9AE" : "1px solid transparent" }}>
              <Medal place={p.rank as 1 | 2 | 3} size={p.rank === 1 ? 26 : 22} />
              <Avatar initial={p.initial} color={p.color} size={p.rank === 1 ? 32 : 28} ring={p.rank === 1 ? APROVA.gold : undefined} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-bold" style={{ color: APROVA.ink }}>{p.name}</span>
              <span className="text-[13px] font-bold tabular" style={{ color: p.rank === 1 ? APROVA.goldDeep : APROVA.inkMuted }}>{p.pts}</span>
            </div>
          ))}
        </div>
      </Link>
      <div className="my-2.5 flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: "#EEF0F5" }} />
        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#B4BAC7" }}>sua posição</span>
        <div className="h-px flex-1" style={{ background: "#EEF0F5" }} />
      </div>
      <div className="flex items-center gap-3 rounded-xl px-2.5 py-2.5" style={{ background: APROVA.blueSoft, border: `1.5px solid ${APROVA.blue}` }}>
        <span className="w-7 text-center font-display text-[14px] font-bold tabular" style={{ color: APROVA.blue }}>#{STUDENT.rank}</span>
        <Avatar initial={STUDENT.initial} color={APROVA.blue} size={28} />
        <span className="min-w-0 flex-1 truncate text-[13px] font-bold" style={{ color: APROVA.ink }}>{STUDENT.name} <span className="font-semibold" style={{ color: APROVA.blue }}>(você)</span></span>
        <span className="text-[13px] font-bold tabular" style={{ color: APROVA.blue }}>{STUDENT.points}</span>
      </div>
    </BentoCard>
  )
}

// ─── Sidebar: últimos simulados ────────────────────────────────────────────────

function RecentExams() {
  const recent = EXAMS.slice(0, 2)
  const color = (s: number) => (s >= 12 ? APROVA.success : s >= 8 ? APROVA.gold : APROVA.error)
  return (
    <BentoCard>
      <SectionTitle title="Últimos simulados" actionLabel="Ver todos" />
      <div className="flex flex-col gap-2">
        {recent.map((e) => (
          <div key={e.id} className="flex items-center gap-3 rounded-xl px-2.5 py-2" style={{ background: "#F6F7FB" }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: MODULES.simulados + "14" }}>
              <Exam size={17} weight="duotone" color={MODULES.simulados} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{e.title}</p>
              <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{e.date} · {e.duration}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[15px] font-bold tabular" style={{ color: color(e.score) }}>{e.score.toFixed(1)}%</p>
              <Link href="/simulados" className="text-[10px] font-bold" style={{ color: APROVA.blue }}>Revisar →</Link>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { greeting, atRisk } = useGreeting()
  return (
    <div className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <div className="mb-3 lg:mb-5"><GreetingHero greeting={greeting} atRisk={atRisk} /></div>

      {/* mobile: flex com ordem por prioridade · desktop: 2 colunas independentes */}
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-5">
        {/* coluna principal (desktop): vídeo → ações rápidas → atividade → últimos simulados */}
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <div className="order-1 lg:order-none"><ContinueCard /></div>
          <div className="order-2 lg:order-none"><QuickActions /></div>
          <div className="order-6 lg:order-none"><ClassFeed /></div>
          <div className="order-5 lg:order-none"><RecentExams /></div>
        </div>

        {/* sidebar (desktop): seu mês → corrida → ranking · "seu mês" oculto no mobile */}
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <div className="hidden lg:block"><MonthSummary /></div>
          <div className="order-3 lg:order-none"><RaceCard /></div>
          <div className="order-4 lg:order-none"><ClassRanking /></div>
        </div>
      </div>
    </div>
  )
}
