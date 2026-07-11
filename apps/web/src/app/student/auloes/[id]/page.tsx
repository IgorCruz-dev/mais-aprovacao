"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft, Users, VideoCamera, ChartBar,
  Check, ChatCircle, PaperPlaneTilt, Star,
  Fire, ShieldStar,
} from "@phosphor-icons/react"
import { APROVA, Avatar, ProgressBar } from "@/components/student/StudentSurface"
import { STUDENT } from "@/lib/mock-data"

// ─── Mock data ────────────────────────────────────────────────────────────────

const SESSION = {
  turma: "Extensivo Medicina 2027",
  topic: "Redação — Estrutura dissertativo-argumentativa",
  teacher: "Prof. Ricardo Alves",
  teacherInitial: "R",
  teacherColor: "#1B4DE4",
  viewersNow: 72,
  enrolled: 85,
  startedSecondsAgo: 34 * 60 + 12,
  sessionXpBase: 45,
}

const LESSON_TOPICS = [
  { id: 1, label: "Introdução", done: true },
  { id: 2, label: "C1 e C2", done: true },
  { id: 3, label: "Argumentação", done: true },
  { id: 4, label: "Coesão C3–C4", done: false, current: true },
  { id: 5, label: "C5 Intervenção", done: false },
]
const LESSON_PROGRESS = 58

const AVATAR_COLORS = [
  "#6C4BD9", "#1B4DE4", "#E23030", "#D97706",
  "#BE185D", "#0891B2", "#0FA968", "#F2600C",
]

interface ChatMsg {
  id: string
  name: string
  initial: string
  color: string
  text: string
  time: Date
  isQ?: boolean
}

const INITIAL_MSGS: ChatMsg[] = [
  { id: "m1", name: "Júlia Rocha",    initial: "J", color: AVATAR_COLORS[0], text: "Que aula incrível!! 🔥🔥",                                              time: new Date(Date.now() - 7 * 60_000) },
  { id: "m2", name: "Bruno Lima",     initial: "B", color: AVATAR_COLORS[1], text: "Consigo usar citação filosófica na C3?",                                 time: new Date(Date.now() - 6 * 60_000), isQ: true },
  { id: "m3", name: "Camila Torres",  initial: "C", color: AVATAR_COLORS[2], text: "Prof explicou C4 de um jeito que finalmente entendi 😭",                 time: new Date(Date.now() - 5 * 60_000) },
  { id: "m4", name: "Pedro Nunes",    initial: "P", color: AVATAR_COLORS[3], text: "A proposta de intervenção precisa ter agente + ação + efeito sempre?",   time: new Date(Date.now() - 4 * 60_000), isQ: true },
  { id: "m5", name: "Letícia Campos", initial: "L", color: AVATAR_COLORS[4], text: "Sim Pedro!! É exatamente isso 👀",                                       time: new Date(Date.now() - 3 * 60_000) },
  { id: "m6", name: "Diego Faria",    initial: "D", color: AVATAR_COLORS[5], text: "Ótima explicação sobre conectivos 👏",                                    time: new Date(Date.now() - 2 * 60_000) },
  { id: "m7", name: "Ana Beatriz",    initial: "A", color: AVATAR_COLORS[6], text: "Esse aulão deveria ter 3 horas 🙌",                                       time: new Date(Date.now() - 60_000) },
]

const INCOMING_MSGS: Omit<ChatMsg, "time">[] = [
  { id: "n1", name: "Rafael Souza",   initial: "R", color: AVATAR_COLORS[7], text: "Concordo demais com a Ana!! 🎯" },
  { id: "n2", name: "Fernanda Lima",  initial: "F", color: AVATAR_COLORS[0], text: "Qual a diferença de solução e proposta de intervenção?", isQ: true },
  { id: "n3", name: "Thiago Mendes",  initial: "T", color: AVATAR_COLORS[3], text: "😱😱😱 nunca vi isso explicado tão bem" },
  { id: "n4", name: "Gabriela Silva", initial: "G", color: AVATAR_COLORS[4], text: "Esse conteúdo caiu certinho no ENEM 2024 🔥" },
  { id: "n5", name: "Lucas Pereira",  initial: "L", color: AVATAR_COLORS[5], text: "Prof, você pode repetir o exemplo da competência 3?" , isQ: true },
]

const POLL = {
  question: "Qual competência você considera mais difícil na redação do ENEM?",
  options: [
    { id: "a", label: "C1 — Norma culta",            pct: 11, votes: 8  },
    { id: "b", label: "C3 — Seleção de argumentos",  pct: 25, votes: 18 },
    { id: "c", label: "C4 — Coesão textual",          pct: 29, votes: 21 },
    { id: "d", label: "C5 — Proposta de intervenção", pct: 35, votes: 25 },
  ],
  total: 72,
}

const REACTIONS = [
  { emoji: "👍", label: "Legal"   },
  { emoji: "❤️", label: "Amei"   },
  { emoji: "🔥", label: "Fogo"   },
  { emoji: "✋", label: "Dúvida" },
  { emoji: "😮", label: "Uau"    },
  { emoji: "🤔", label: "Hmm"    },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(d: Date) {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDuration(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(h)}:${p(m)}:${p(sec)}`
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface FloatingItem { id: string; content: string; x: number }

export default function AulaoStudentPage() {
  const [elapsed, setElapsed]           = useState(SESSION.startedSecondsAgo)
  const [messages, setMessages]         = useState<ChatMsg[]>(INITIAL_MSGS)
  const [floating, setFloating]         = useState<FloatingItem[]>([])
  const [pollAnswer, setPollAnswer]     = useState<string | null>(null)
  const [pollBarWidths, setPollBarWidths] = useState(POLL.options.map(() => 0))
  const [pollVisible, setPollVisible]   = useState(true)
  const [sessionXp, setSessionXp]       = useState(SESSION.sessionXpBase)
  const [viewers, setViewers]           = useState(SESSION.viewersNow)
  const [msgInput, setMsgInput]         = useState("")
  const chatRef                         = useRef<HTMLDivElement>(null)
  const incomingIdxRef                  = useRef(0)

  // Duration ticker
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Simulated incoming chat messages
  useEffect(() => {
    const t = setInterval(() => {
      if (incomingIdxRef.current >= INCOMING_MSGS.length) return
      const next = INCOMING_MSGS[incomingIdxRef.current++]
      setMessages(prev => [...prev, { ...next, time: new Date() }])
    }, 5500)
    return () => clearInterval(t)
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  // Animate poll bars after answering
  useEffect(() => {
    if (!pollAnswer) return
    const t = setTimeout(() => setPollBarWidths(POLL.options.map(o => o.pct)), 350)
    return () => clearTimeout(t)
  }, [pollAnswer])

  // Slight viewer fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      setViewers(v => Math.max(68, Math.min(78, v + (Math.random() > 0.5 ? 1 : -1))))
    }, 8000)
    return () => clearInterval(t)
  }, [])

  // Pre-compute static waveform bars once
  const waveformBars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      opacity: 0.1 + Math.abs(Math.sin(i * 0.42)) * 0.35,
      height: 15 + Math.abs(Math.sin(i * 0.38 + 1.1)) * 60,
    })), [])

  function spawnFloating(content: string) {
    const id = `${content}-${Date.now()}`
    const x = 8 + Math.random() * 76
    setFloating(prev => [...prev, { id, content, x }])
    setTimeout(() => setFloating(prev => prev.filter(e => e.id !== id)), 2100)
  }

  function fireReaction(emoji: string) {
    spawnFloating(emoji)
    setSessionXp(xp => xp + 2)
  }

  function handleVote(optId: string) {
    if (pollAnswer) return
    setPollAnswer(optId)
    setSessionXp(xp => xp + 5)
    spawnFloating("✅")
  }

  function sendMessage() {
    if (!msgInput.trim()) return
    const firstName = STUDENT.name.split(" ")[0]
    setMessages(prev => [
      ...prev,
      { id: `u-${Date.now()}`, name: firstName, initial: STUDENT.initial, color: APROVA.blue, text: msgInput.trim(), time: new Date() },
    ])
    setMsgInput("")
    setSessionXp(xp => xp + 1)
  }

  const streakDays           = STUDENT.streak
  const nextStreakMilestone  = streakDays < 7 ? 7 : streakDays < 14 ? 14 : 30
  const streakProgress       = Math.round((streakDays / nextStreakMilestone) * 100)
  const maxPollPct           = Math.max(...POLL.options.map(o => o.pct))

  return (
    <div className="min-h-screen pb-8" style={{ background: APROVA.navy }}>

      {/* Inject page-scoped keyframes */}
      <style>{`
        @keyframes floatEmoji {
          0%   { opacity: 1; transform: translateY(0)     scale(1);   }
          75%  { opacity: 1; transform: translateY(-75px)  scale(1.45); }
          100% { opacity: 0; transform: translateY(-110px) scale(1.6); }
        }
        @keyframes pollSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes xpBump {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.3); }
        }
        @keyframes livePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(226,48,48,0.5);  }
          50%     { box-shadow: 0 0 0 6px rgba(226,48,48,0);   }
        }
      `}</style>

      {/* ── Sticky top bar ─────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(6,14,39,0.94)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          href="/student/auloes"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <ArrowLeft size={17} color="rgba(255,255,255,0.65)" />
        </Link>

        {/* Live badge */}
        <div
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: APROVA.error, animation: "livePulse 2s ease infinite" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" style={{ animation: "glowPulse 1.4s ease infinite" }} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Ao vivo</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-white">{SESSION.topic}</p>
          <p className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {SESSION.turma} · {SESSION.teacher}
          </p>
        </div>

        {/* Viewers */}
        <div
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Users size={12} color="rgba(255,255,255,0.55)" />
          <span className="text-[12px] font-bold tabular text-white">{viewers}</span>
        </div>

        {/* XP */}
        <div
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5"
          style={{ background: "rgba(255,197,41,0.12)", border: "1px solid rgba(255,197,41,0.22)" }}
          key={sessionXp}
        >
          <Star size={12} weight="fill" color={APROVA.gold} />
          <span
            className="text-[12px] font-bold tabular"
            style={{ color: APROVA.gold, animation: "xpBump 0.35s ease" }}
          >
            {sessionXp} pts
          </span>
        </div>
      </div>

      {/* ── Main layout ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-4 py-4 lg:grid lg:grid-cols-[1fr_360px] lg:gap-5 lg:px-6">

        {/* ── Left: video + progress + reactions ──────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* Video placeholder */}
          <div
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ aspectRatio: "16/9", background: "#070D1E" }}
          >
            {/* Purple/blue ambient glow */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 18% 35%, rgba(108,75,217,0.28) 0%, transparent 55%)" }} />
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 78% 70%, rgba(27,77,228,0.22) 0%, transparent 50%)" }} />
            {/* Subtle grid */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: "linear-gradient(rgba(108,75,217,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,75,217,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
            />

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(108,75,217,0.35)", animation: "glowPulse 2.5s ease infinite" }} />
                  <div className="absolute -inset-3 rounded-full" style={{ border: "1px solid rgba(77,124,255,0.18)", animation: "glowPulse 2.5s ease infinite 0.8s" }} />
                  <div
                    className="relative flex h-full w-full items-center justify-center rounded-2xl"
                    style={{ background: "rgba(27,77,228,0.2)", border: "1px solid rgba(77,124,255,0.35)", boxShadow: "0 0 50px rgba(108,75,217,0.3)" }}
                  >
                    <VideoCamera size={32} weight="fill" color="#4D7CFF" />
                  </div>
                </div>
                <p className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Transmissão em andamento
                </p>
                <p className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.28)" }}>Amazon IVS · Low-latency · 1080p</p>
              </div>
            </div>

            {/* Waveform */}
            <div className="absolute bottom-0 left-0 right-0 flex h-14 items-end gap-px px-2 pb-3">
              {waveformBars.map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{ background: `rgba(108,75,217,${bar.opacity})`, height: `${bar.height}%` }}
                />
              ))}
            </div>

            {/* AO VIVO */}
            <div
              className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ background: APROVA.error }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" style={{ animation: "glowPulse 1.4s ease infinite" }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Ao vivo</span>
            </div>

            {/* Duration */}
            <div
              className="absolute right-3 top-3 rounded-xl px-2.5 py-1"
              style={{ background: "rgba(0,0,0,0.65)" }}
            >
              <span className="font-display text-[13px] font-bold tabular text-white">{formatDuration(elapsed)}</span>
            </div>

            {/* Teacher info */}
            <div
              className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl px-2.5 py-1.5"
              style={{ background: "rgba(0,0,0,0.72)" }}
            >
              <Avatar initial={SESSION.teacherInitial} color={SESSION.teacherColor} size={22} />
              <div>
                <p className="text-[10px] font-bold text-white">{SESSION.teacher}</p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>Redação</p>
              </div>
            </div>

            {/* Viewers bottom-right */}
            <div
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2 py-1"
              style={{ background: "rgba(0,0,0,0.65)" }}
            >
              <Users size={11} weight="fill" color="rgba(255,255,255,0.75)" />
              <span className="text-[10px] font-bold text-white">{viewers} online</span>
            </div>

            {/* Floating emojis */}
            {floating.map(f => (
              <div
                key={f.id}
                className="pointer-events-none absolute select-none text-3xl"
                style={{ bottom: "10%", left: `${f.x}%`, animation: "floatEmoji 2s ease-out forwards" }}
              >
                {f.content}
              </div>
            ))}
          </div>

          {/* Lesson topic progress */}
          <div
            className="rounded-2xl p-4"
            style={{ background: APROVA.navy2, border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.35)" }}>
                Tópicos da aula
              </p>
              <p className="text-[11px] font-bold" style={{ color: APROVA.gold }}>{LESSON_PROGRESS}% assistido</p>
            </div>

            {/* Gradient progress bar */}
            <div className="relative mb-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${LESSON_PROGRESS}%`,
                  background: "linear-gradient(90deg, #1B4DE4, #6C4BD9)",
                  boxShadow: "0 0 10px rgba(108,75,217,0.7)",
                  transition: "width 1s ease",
                }}
              />
            </div>

            {/* Topic markers */}
            <div className="flex items-start gap-2">
              {LESSON_TOPICS.map((topic, i) => (
                <div key={topic.id} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                      background: topic.done
                        ? "linear-gradient(135deg, #0FA968, #0a8754)"
                        : topic.current
                          ? "linear-gradient(135deg, #1B4DE4, #6C4BD9)"
                          : "rgba(255,255,255,0.07)",
                      boxShadow: topic.current ? "0 0 14px rgba(108,75,217,0.7)" : undefined,
                      border: topic.current ? "1.5px solid rgba(77,124,255,0.5)" : undefined,
                    }}
                  >
                    {topic.done
                      ? <Check size={13} weight="bold" color="white" />
                      : <span className="text-[10px] font-bold" style={{ color: topic.current ? "white" : "rgba(255,255,255,0.25)" }}>{i + 1}</span>
                    }
                  </div>
                  <p
                    className="text-center text-[9.5px] font-semibold leading-tight"
                    style={{
                      color: topic.done
                        ? "rgba(255,255,255,0.65)"
                        : topic.current
                          ? "white"
                          : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {topic.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick reactions */}
          <div
            className="rounded-2xl p-3.5"
            style={{ background: APROVA.navy2, border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p
              className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              Reações rápidas
            </p>
            <div className="flex items-center justify-center gap-2">
              {REACTIONS.map(r => (
                <button
                  key={r.emoji}
                  onClick={() => fireReaction(r.emoji)}
                  className="flex flex-col items-center gap-1 rounded-2xl p-3 text-[22px] transition-all active:scale-90 hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}
                  title={r.label}
                >
                  {r.emoji}
                  <span className="text-[9px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-col gap-3 lg:mt-0">

          {/* Streak / gamification card */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(242,96,12,0.18) 0%, rgba(255,197,41,0.1) 100%)",
              border: "1px solid rgba(242,96,12,0.3)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[26px]"
                style={{ background: "rgba(242,96,12,0.15)", animation: "floatY 3s ease-in-out infinite" }}
              >
                🔥
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-extrabold text-white">Você está em chamas!</p>
                <p className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  <span style={{ color: APROVA.streak, fontWeight: 800 }}>{streakDays} aulões</span> seguidos 💪
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12px] font-bold" style={{ color: APROVA.gold }}>+{sessionXp} pts</p>
                <p className="text-[9.5px]" style={{ color: "rgba(255,255,255,0.35)" }}>hoje</p>
              </div>
            </div>

            {/* Streak progress to next milestone */}
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between text-[10px]">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Próximo marco</span>
                <span style={{ color: APROVA.streak, fontWeight: 700 }}>{streakDays}/{nextStreakMilestone} 🔥</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${streakProgress}%`,
                    background: `linear-gradient(90deg, ${APROVA.streak}, ${APROVA.gold})`,
                    boxShadow: `0 0 10px ${APROVA.streak}80`,
                    transition: "width 1s ease",
                  }}
                />
              </div>
              <p className="mt-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Chegue em {nextStreakMilestone} dias e ganhe 1 escudo 🛡️
              </p>
            </div>
          </div>

          {/* Poll card */}
          {pollVisible && (
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                background: pollAnswer ? APROVA.navy2 : "linear-gradient(135deg, rgba(27,77,228,0.14), rgba(108,75,217,0.12))",
                border: pollAnswer ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(77,124,255,0.35)",
                boxShadow: pollAnswer ? undefined : "0 0 24px rgba(27,77,228,0.18)",
                animation: "pollSlideIn 0.45s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* Poll header */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <ChartBar size={14} weight="fill" color={pollAnswer ? "rgba(255,255,255,0.4)" : "#4D7CFF"} />
                <p className="flex-1 text-[12px] font-bold" style={{ color: pollAnswer ? "rgba(255,255,255,0.7)" : "white" }}>
                  {pollAnswer ? "Resultado da enquete" : "📊 O prof. lançou uma enquete!"}
                </p>
                {pollAnswer && (
                  <button
                    onClick={() => setPollVisible(false)}
                    className="text-[10px] font-bold transition-opacity hover:opacity-70"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    fechar
                  </button>
                )}
              </div>

              <div className="p-4">
                <p className="mb-4 text-[12.5px] font-semibold leading-snug text-white">
                  {POLL.question}
                </p>

                {/* Options to vote */}
                {!pollAnswer && (
                  <div className="flex flex-col gap-2">
                    {POLL.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleVote(opt.id)}
                        className="w-full rounded-xl px-3.5 py-3 text-left text-[12.5px] font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Results after vote */}
                {pollAnswer && (
                  <div className="flex flex-col gap-3">
                    {POLL.options.map((opt, i) => {
                      const isMyVote = opt.id === pollAnswer
                      const isWinner = opt.pct === maxPollPct
                      const barColor = isMyVote
                        ? APROVA.gold
                        : isWinner
                          ? "#4D7CFF"
                          : "rgba(255,255,255,0.25)"
                      return (
                        <div key={opt.id}>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {isMyVote && (
                                <span
                                  className="flex h-4 w-4 items-center justify-center rounded-full"
                                  style={{ background: APROVA.gold }}
                                >
                                  <Check size={9} weight="bold" color={APROVA.navy} />
                                </span>
                              )}
                              <p
                                className="text-[11px] font-semibold"
                                style={{ color: isMyVote ? APROVA.gold : "rgba(255,255,255,0.65)" }}
                              >
                                {opt.label}
                              </p>
                            </div>
                            <span className="shrink-0 text-[11px] font-bold tabular" style={{ color: barColor }}>
                              {opt.pct}%
                            </span>
                          </div>
                          <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pollBarWidths[i]}%`,
                                background: barColor,
                                boxShadow: isMyVote ? `0 0 8px ${APROVA.gold}80` : undefined,
                                transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {POLL.total} alunos responderam · +5 pts ganhos ✨
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat */}
          <div
            className="flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: APROVA.navy2,
              border: "1px solid rgba(255,255,255,0.06)",
              minHeight: 280,
              maxHeight: 380,
            }}
          >
            {/* Chat header */}
            <div
              className="flex shrink-0 items-center gap-2 px-4 py-2.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <ChatCircle size={13} weight="fill" color="rgba(255,255,255,0.4)" />
              <p className="text-[12px] font-bold text-white">Chat ao vivo</p>
              <span className="ml-auto text-[10.5px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                {messages.length} msgs
              </span>
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              className="scrollbar-none flex-1 overflow-y-auto px-3 py-3"
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="flex flex-col gap-2.5">
                {messages.map(msg => {
                  const firstName = STUDENT.name.split(" ")[0]
                  const isMe = msg.name === firstName
                  return (
                    <div key={msg.id} className="flex items-start gap-2" style={{ animation: "slideUp 0.3s ease" }}>
                      <Avatar initial={msg.initial} color={isMe ? APROVA.blue : msg.color} size={24} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="text-[11px] font-bold"
                            style={{ color: isMe ? APROVA.blueBright : "rgba(255,255,255,0.65)" }}
                          >
                            {isMe ? "Você" : msg.name}
                          </span>
                          {msg.isQ && (
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                              style={{ background: "rgba(27,77,228,0.22)", color: "#4D7CFF" }}
                            >
                              ✋ dúvida
                            </span>
                          )}
                          <span className="text-[9.5px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                            {formatTime(msg.time)}
                          </span>
                        </div>
                        <p
                          className="mt-0.5 text-[12px] leading-snug"
                          style={{ color: "rgba(255,255,255,0.82)" }}
                        >
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Message input */}
            <div
              className="shrink-0 px-3 py-2.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <input
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage() }}
                  placeholder="Mensagem ou dúvida…"
                  className="flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-white/30"
                />
                <button
                  onClick={sendMessage}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-80 active:scale-90"
                  style={{ background: APROVA.blue }}
                >
                  <PaperPlaneTilt size={13} weight="fill" color="white" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
