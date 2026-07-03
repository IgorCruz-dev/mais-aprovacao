"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Flame, Shield, Zap, Trophy, Video, Play, BookOpen, FileText, PenLine, TrendingUp } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import {
  AnimatedProgressBar,
  ConcentricDecoration,
  DarkHeroCard,
  EditorialStats,
  SectionTitle,
  StripeCard,
} from "@/components/student/StudentSurface"
import {
  STUDENT,
  CURRENT_LESSON,
  EXAMS,
  RANKING_PODIUM,
  CLASS_ACTIVITY,
} from "@/lib/mock-data"

// ─── Typewriter ───────────────────────────────────────────────────────────────

const WORDS = ["estudar", "evoluir", "conquistar", "vencer", "brilhar", "ser aprovado"]

function TypewriterText() {
  const [display, setDisplay] = useState("")
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pausing, setPausing] = useState(false)

  useEffect(() => {
    if (pausing) {
      const t = setTimeout(() => {
        setPausing(false)
        setIsDeleting(true)
      }, 2200)
      return () => clearTimeout(t)
    }

    const word = WORDS[wordIdx]
    const delay = isDeleting ? 40 : 80

    const t = setTimeout(() => {
      if (!isDeleting) {
        const next = word.slice(0, charIdx + 1)
        setDisplay(next)
        if (charIdx + 1 === word.length) {
          setPausing(true)
        } else {
          setCharIdx((c) => c + 1)
        }
      } else {
        const next = word.slice(0, charIdx - 1)
        setDisplay(next)
        if (charIdx - 1 === 0) {
          setIsDeleting(false)
          setWordIdx((i) => (i + 1) % WORDS.length)
          setCharIdx(0)
        } else {
          setCharIdx((c) => c - 1)
        }
      }
    }, delay)

    return () => clearTimeout(t)
  }, [charIdx, wordIdx, isDeleting, pausing])

  return (
    <div className="text-right leading-tight">
      <p className="text-[11px] text-[#AAAAAA] font-[500]">Nós nascemos</p>
      <p className="text-[14px] font-[700]" style={{ color: BRAND }}>
        para {display}
        <span
          className="inline-block"
          style={{ animation: "blink 0.9s step-end infinite", marginLeft: 1 }}
        >
          |
        </span>
      </p>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsRow() {
  const items = [
    { value: <span className="flex items-center gap-1"><Flame size={16} style={{ color: "#E84A00" }} />{STUDENT.streak}</span>, label: "ofensiva", color: "#111" },
    { value: <span className="flex items-center gap-1"><Shield size={14} style={{ color: "#1A6FCC" }} />{STUDENT.shields}</span>, label: "escudos", color: "#111" },
    { value: <span className="flex items-center gap-1"><Zap size={14} style={{ color: "#CC7A00" }} />{STUDENT.points}</span>, label: "pts", color: "#111" },
    { value: <span className="flex items-center gap-1"><Trophy size={14} style={{ color: BRAND }} />#{STUDENT.rank}</span>, label: "ranking", color: "#111" },
  ]
  return <EditorialStats items={items} align="center" />
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard() {
  return (
    <DarkHeroCard watermark={String(CURRENT_LESSON.progress)}>
      {/* Tag */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="rounded-full px-2.5 py-1 text-[9px] font-[800] uppercase tracking-wide"
          style={{ background: "rgba(37,99,235,0.18)", color: "#93B8F8" }}
        >
          Continue de onde parou
        </span>
        <span className="flex items-center gap-1 text-[10px] font-[700]" style={{ color: "#93B8F8" }}>
          <Video size={11} /> VIDEOAULA
        </span>
      </div>

      {/* Title */}
      <h2 className="text-[22px] font-black text-white leading-tight mb-1" style={{ letterSpacing: "-0.5px" }}>
        {CURRENT_LESSON.title}
      </h2>
      <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
        Aula {CURRENT_LESSON.lesson} de {CURRENT_LESSON.totalLessons} · {CURRENT_LESSON.professor} · {CURRENT_LESSON.lastWatched}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
          <span>Assistido</span>
          <span className="font-[700] text-white">{CURRENT_LESSON.progress}%</span>
        </div>
        <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,0.08)" }}>
          <AnimatedProgressBar pct={CURRENT_LESSON.progress} color={BRAND} height={8} background="transparent" />
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/aulas"
        className="flex items-center justify-center gap-2 w-full rounded-full py-3 text-[14px] font-black text-white transition-opacity hover:opacity-90"
        style={{ background: BRAND }}
      >
        <Play size={14} fill="white" /> Continuar assistindo
      </Link>
    </DarkHeroCard>
  )
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

function QuickActions() {
  const actions = [
    { icon: BookOpen, title: "Questões", subtitle: "Banco livre", color: "#185FA5", href: "/questoes" },
    { icon: FileText, title: "Simulado", subtitle: "Cronometrado", color: "#D97706", href: "/simulados" },
    { icon: PenLine, title: "Redação", subtitle: "Enviar texto", color: "#534AB7", href: "/redacoes" },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map(({ icon: Icon, title, subtitle, color, href }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col gap-2 rounded-[18px] p-3.5 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97]"
          style={{ background: color }}
        >
          <Icon size={22} className="text-white" />
          <div>
            <p className="text-[13px] font-[800] text-white leading-tight">{title}</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>{subtitle}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── Race to Approval ─────────────────────────────────────────────────────────

function RaceToApproval() {
  const target = 1500
  const pct = (STUDENT.points / target) * 100

  return (
    <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} style={{ color: BRAND }} />
          <p className="text-[11px] font-[700] uppercase tracking-wide text-[#AAAAAA]">Corrida para Aprovação</p>
        </div>
        <span className="text-[11px] font-[700] text-right text-[#AAAAAA]">Junho 2026</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-[700]"
          style={{ background: "rgba(37,99,235,0.08)", color: BRAND }}
        >
          {STUDENT.points} pts
        </span>
      </div>
      <AnimatedProgressBar pct={pct} color={BRAND} height={8} background="#F0F0F0" />
      <p className="mt-2 text-[11px] text-[#AAAAAA]">
        Faltam {(target - STUDENT.points).toLocaleString("pt-BR")} pts para o topo
      </p>
    </div>
  )
}

// ─── Class Activity ───────────────────────────────────────────────────────────

function ClassActivity() {
  return (
    <div>
      <SectionTitle title="ATIVIDADE DA TURMA" actionLabel="Ver tudo →" />
      <div className="mt-3 flex flex-col gap-0">
        {CLASS_ACTIVITY.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < CLASS_ACTIVITY.length - 1 ? "0.5px solid #F0F0F0" : undefined }}>
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full text-[13px] font-black text-white"
              style={{ width: 34, height: 34, background: item.color }}
            >
              {item.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-[600] text-[#111] leading-snug">
                <span className="font-[800]">{item.name}</span> {item.action}
              </p>
            </div>
            <span className="text-[10px] text-[#AAAAAA] flex-shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Right Panel (Desktop) ────────────────────────────────────────────────────

function RightPanel() {
  const recentExams = EXAMS.slice(0, 2)
  return (
    <div className="flex flex-col gap-4">
      {/* Stats compact */}
      <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4">
        <p className="text-[10px] font-[700] uppercase tracking-wide text-[#AAAAAA] mb-3">Seu mês</p>
        <div className="flex flex-col gap-2">
          {[
            { label: "Ofensiva", value: `${STUDENT.streak} dias 🔥`, color: "#E84A00" },
            { label: "Pontos", value: `${STUDENT.points} pts`, color: "#CC7A00" },
            { label: "Ranking", value: `#${STUDENT.rank}`, color: BRAND },
          ].map((s) => (
            <div key={s.label} className="flex justify-between items-center">
              <span className="text-[12px] text-[#888]">{s.label}</span>
              <span className="text-[13px] font-[800]" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Race */}
      <RaceToApproval />

      {/* Mini ranking */}
      <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-4">
        <SectionTitle title="Ranking da turma" />
        <div className="mt-3 flex flex-col gap-2">
          {RANKING_PODIUM.map((p) => (
            <div key={p.rank} className="flex items-center gap-2">
              <span className="text-[12px] font-black w-5 text-center" style={{ color: p.rank === 1 ? "#D97706" : "#888" }}>
                {p.rank}°
              </span>
              <div
                className="flex items-center justify-center rounded-full text-[11px] font-black text-white flex-shrink-0"
                style={{ width: 26, height: 26, background: p.color }}
              >
                {p.initial}
              </div>
              <span className="text-[12px] font-[700] text-[#111] flex-1">{p.name}</span>
              <span className="text-[12px] font-[800]" style={{ color: BRAND }}>{p.pts} pts</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-[#F0F0F0] flex items-center gap-2">
            <span className="text-[12px] font-black w-5 text-center text-[#888]">#{STUDENT.rank}</span>
            <div
              className="flex items-center justify-center rounded-full text-[11px] font-black flex-shrink-0"
              style={{ width: 26, height: 26, background: "#111", color: BRAND }}
            >
              {STUDENT.initial}
            </div>
            <span className="text-[12px] font-[700] text-[#111] flex-1">{STUDENT.name}</span>
            <span className="text-[12px] font-[800]" style={{ color: BRAND }}>{STUDENT.points} pts</span>
          </div>
        </div>
      </div>

      {/* Recent exams */}
      <div>
        <SectionTitle title="Últimos simulados" />
        <div className="mt-3 flex flex-col gap-2">
          {recentExams.map((exam) => (
            <StripeCard key={exam.id} color="#D97706">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-[700] text-[#111]">{exam.title}</p>
                  <p className="text-[10px] text-[#888]">{exam.date} · {exam.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-black" style={{ color: exam.score >= 60 ? "#0F6E56" : exam.score >= 30 ? "#D97706" : "#D14000" }}>
                    {exam.score.toFixed(1)}%
                  </p>
                  <Link href="/simulados" className="text-[10px] font-[700]" style={{ color: BRAND }}>
                    Revisar →
                  </Link>
                </div>
              </div>
            </StripeCard>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-5 pb-8">
      {/* Greeting row */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[12px] text-[#AAAAAA] font-[500]">Boa noite,</p>
          <h1 className="text-[42px] font-black text-[#111] leading-none" style={{ letterSpacing: "-2px" }}>
            Igor!
          </h1>
        </div>
        <TypewriterText />
      </div>

      {/* 2-col layout on desktop */}
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
        {/* Main */}
        <div className="flex flex-col gap-5">
          <StatsRow />
          <HeroCard />
          <QuickActions />

          {/* Race — mobile only */}
          <div className="lg:hidden">
            <RaceToApproval />
          </div>

          <ClassActivity />
        </div>

        {/* Right panel — desktop only */}
        <div className="hidden lg:block">
          <RightPanel />
        </div>
      </div>
    </div>
  )
}
