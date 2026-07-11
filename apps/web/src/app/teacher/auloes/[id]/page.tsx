"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
  VideoCamera, Users, ChatCircle, ChartBar, PushPin, X,
  XCircle, Warning, Plus, ArrowRight, Clock, ChatSlash,
  UsersThree, Stop, Radio,
} from "@phosphor-icons/react"
import {
  APROVA, Avatar, GradientAreaChart, NavyCard, BentoCard,
} from "@/components/student/StudentSurface"

// ─── Mock data ────────────────────────────────────────────────────────────────

const SESSION = {
  turma: "Extensivo Medicina 2027",
  topic: "Redação — Estrutura dissertativo-argumentativa",
  teacher: "Prof. Ricardo Alves",
  discipline: "Redação",
  enrolled: 85,
  startedSecondsAgo: 34 * 60 + 12,
}

const AVATAR_COLORS = [
  "#1B4DE4", "#E23030", "#0FA968", "#F2600C",
  "#6C4BD9", "#D97706", "#0891B2", "#BE185D",
]

interface ChatMessage {
  id: string
  studentName: string
  initial: string
  color: string
  text: string
  timestamp: Date
  isQuestion?: boolean
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "m1", studentName: "Ana Beatriz", initial: "A", color: AVATAR_COLORS[0], text: "Prof, a tese precisa sempre estar na introdução?", timestamp: new Date(Date.now() - 8 * 60_000), isQuestion: true },
  { id: "m2", studentName: "Carlos Henrique", initial: "C", color: AVATAR_COLORS[1], text: "Boa tarde, professor! Estou aqui 🙌", timestamp: new Date(Date.now() - 7 * 60_000) },
  { id: "m3", studentName: "Fernanda Lima", initial: "F", color: AVATAR_COLORS[2], text: "Posso usar dados do IBGE como argumento de autoridade?", timestamp: new Date(Date.now() - 6 * 60_000), isQuestion: true },
  { id: "m4", studentName: "Gabriel Santos", initial: "G", color: AVATAR_COLORS[4], text: "Qual é a diferença entre proposta de intervenção e solução?", timestamp: new Date(Date.now() - 5 * 60_000), isQuestion: true },
  { id: "m5", studentName: "Isabela Costa", initial: "I", color: AVATAR_COLORS[5], text: "Muito boa a explicação sobre os conectivos!", timestamp: new Date(Date.now() - 4 * 60_000) },
  { id: "m6", studentName: "Lucas Pereira", initial: "L", color: AVATAR_COLORS[6], text: "O parágrafo de conclusão pode ter 5 linhas?", timestamp: new Date(Date.now() - 3 * 60_000), isQuestion: true },
  { id: "m7", studentName: "Mariana Oliveira", initial: "M", color: AVATAR_COLORS[7], text: "Prof, eu estava com dificuldade nisso — agora ficou claro 👏", timestamp: new Date(Date.now() - 2 * 60_000) },
  { id: "m8", studentName: "Rafael Souza", initial: "R", color: AVATAR_COLORS[3], text: "Consegue dar um exemplo prático do agente de intervenção?", timestamp: new Date(Date.now() - 60_000), isQuestion: true },
]

const INCOMING_MESSAGES: Omit<ChatMessage, "timestamp">[] = [
  { id: "i1", studentName: "Bruna Almeida", initial: "B", color: AVATAR_COLORS[0], text: "Prof, pode repetir sobre progressão temática?", isQuestion: true },
  { id: "i2", studentName: "Thiago Mendes", initial: "T", color: AVATAR_COLORS[2], text: "Entendido! Obrigado professor 👏" },
  { id: "i3", studentName: "Julia Rocha", initial: "J", color: AVATAR_COLORS[4], text: "Na competência 3, conectivos adversativos contam como articulação?", isQuestion: true },
  { id: "i4", studentName: "Pedro Nunes", initial: "P", color: AVATAR_COLORS[5], text: "Adorei o exemplo do ENEM 2023" },
  { id: "i5", studentName: "Camila Torres", initial: "C", color: AVATAR_COLORS[1], text: "Prof, o que é uma proposta de intervenção detalhada?", isQuestion: true },
  { id: "i6", studentName: "Diego Faria", initial: "D", color: AVATAR_COLORS[6], text: "Incrível como aprendo mais ao vivo 🔥" },
  { id: "i7", studentName: "Letícia Campos", initial: "L", color: AVATAR_COLORS[7], text: "Prof, posso usar citação direta na conclusão?", isQuestion: true },
]

const AUDIENCE_HISTORY = [45, 52, 58, 61, 65, 68, 71, 72, 70, 73, 72, 74]

const POLL = {
  question: "Qual competência você considera mais difícil na redação do ENEM?",
  options: [
    { label: "C1 — Norma culta",            votes: 8,  pct: 11 },
    { label: "C3 — Seleção de argumentos",  votes: 18, pct: 25 },
    { label: "C4 — Coesão textual",          votes: 21, pct: 29 },
    { label: "C5 — Proposta de intervenção", votes: 25, pct: 35 },
  ],
  total: 72,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ background: APROVA.error }}
    >
      <span
        className="h-2 w-2 rounded-full bg-white"
        style={{ animation: "glowPulse 1.4s ease infinite" }}
      />
      <span className="text-[11px] font-black uppercase tracking-[0.1em] text-white">Ao vivo</span>
    </div>
  )
}

function MetricTile({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub?: string
  icon: typeof Clock
  color: string
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{ background: "#fff", border: "1px solid #EEF1F7", boxShadow: "0 1px 4px rgba(10,15,30,0.04)" }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: color + "14" }}
      >
        <Icon size={18} weight="fill" color={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: APROVA.inkMuted }}>{label}</p>
        <p className="font-display text-[20px] font-bold tabular" style={{ color: APROVA.ink }}>{value}</p>
        {sub && <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AulaoLivePage() {
  const [elapsed, setElapsed] = useState(SESSION.startedSecondsAgo)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [chatMuted, setChatMuted] = useState(false)
  const [pinnedId, setPinnedId] = useState<string | null>("m1")
  const [pollState, setPollState] = useState<"idle" | "creating" | "active">("active")
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState(["", "", "", ""])
  const [pollBarWidths, setPollBarWidths] = useState(POLL.options.map(() => 0))
  const [audienceNow, setAudienceNow] = useState(72)
  const [audienceHistory, setAudienceHistory] = useState(AUDIENCE_HISTORY)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const incomingIdx = useRef(0)

  // Duration ticker
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Simulate incoming chat messages
  useEffect(() => {
    const t = setInterval(() => {
      if (chatMuted) return
      if (incomingIdx.current >= INCOMING_MESSAGES.length) return
      const next = INCOMING_MESSAGES[incomingIdx.current++]
      setMessages(prev => [...prev, { ...next, timestamp: new Date() }])
    }, 6000)
    return () => clearInterval(t)
  }, [chatMuted])

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Animate poll bars on mount / when poll becomes active
  useEffect(() => {
    if (pollState !== "active") {
      setPollBarWidths(POLL.options.map(() => 0))
      return
    }
    const t = setTimeout(() => {
      setPollBarWidths(POLL.options.map(o => o.pct))
    }, 300)
    return () => clearTimeout(t)
  }, [pollState])

  // Slight audience fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      setAudienceNow(prev => {
        const next = Math.max(68, Math.min(78, prev + (Math.random() > 0.5 ? 1 : -1)))
        setAudienceHistory(h => [...h.slice(-11), next])
        return next
      })
    }, 9000)
    return () => clearInterval(t)
  }, [])

  // Static waveform bars — computed once
  const waveformBars = useMemo(() =>
    Array.from({ length: 64 }, (_, i) => ({
      opacity: 0.18 + Math.abs(Math.sin(i * 0.42)) * 0.45,
      height: 20 + Math.abs(Math.sin(i * 0.38 + 1.1)) * 55,
    })), [])

  const pinnedMsg = messages.find(m => m.id === pinnedId)
  const maxPollPct = Math.max(...POLL.options.map(o => o.pct))

  return (
    <div className="min-h-screen pb-10" style={{ background: APROVA.surface }}>

      {/* ── Session hero bar ─────────────────────────────────────────────── */}
      <NavyCard halftone="blue" className="mb-5 rounded-none px-4 py-4 lg:rounded-none lg:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4">
          <LiveBadge />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-white">{SESSION.topic}</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {SESSION.turma} · {SESSION.teacher} · {SESSION.discipline}
            </p>
          </div>

          {/* Duration */}
          <div
            className="hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Clock size={13} color="rgba(255,255,255,0.45)" />
            <span className="font-display text-[18px] font-bold tabular text-white">{formatDuration(elapsed)}</span>
          </div>

          {/* End button */}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors"
            style={{
              background: "rgba(226,48,48,0.16)",
              border: "1px solid rgba(226,48,48,0.32)",
              color: "#FF7070",
            }}
          >
            <Stop size={14} weight="fill" />
            <span className="hidden sm:inline">Encerrar transmissão</span>
            <span className="sm:hidden">Encerrar</span>
          </button>
        </div>
      </NavyCard>

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-5">

          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Video placeholder */}
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ background: "#080E20", aspectRatio: "16/9" }}
            >
              {/* Subtle grid */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(77,124,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(77,124,255,0.04) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                      background: "rgba(27,77,228,0.18)",
                      border: "1px solid rgba(77,124,255,0.28)",
                      boxShadow: "0 0 40px rgba(27,77,228,0.25)",
                    }}
                  >
                    <VideoCamera size={32} weight="fill" color="#4D7CFF" />
                  </div>
                  <p className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Transmissão em andamento
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                    Amazon IVS · Low-latency · 1080p
                  </p>
                </div>
              </div>

              {/* Audio waveform */}
              <div className="absolute bottom-0 left-0 right-0 flex h-14 items-end gap-[2px] px-3 pb-3">
                {waveformBars.map((bar, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full"
                    style={{ background: `rgba(77,124,255,${bar.opacity})`, height: `${bar.height}%` }}
                  />
                ))}
              </div>

              {/* Overlays */}
              {/* AO VIVO */}
              <div
                className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: APROVA.error }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-white"
                  style={{ animation: "glowPulse 1.4s ease infinite" }}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Ao vivo</span>
              </div>

              {/* Duration */}
              <div
                className="absolute right-3 top-3 rounded-xl px-2.5 py-1 sm:hidden"
                style={{ background: "rgba(0,0,0,0.65)" }}
              >
                <span className="font-display text-[14px] font-bold tabular text-white">{formatDuration(elapsed)}</span>
              </div>

              {/* Quality */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ background: "rgba(0,0,0,0.65)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: APROVA.success }} />
                <span className="text-[10px] font-bold text-white">1080p · 4.2 Mbps</span>
              </div>

              {/* Viewer count */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ background: "rgba(0,0,0,0.65)" }}>
                <Users size={11} weight="fill" color="rgba(255,255,255,0.8)" />
                <span className="text-[10px] font-bold text-white">{audienceNow} assistindo</span>
              </div>
            </div>

            {/* Pinned message */}
            {pinnedMsg && (
              <div
                className="flex items-start gap-3 rounded-2xl px-4 py-3"
                style={{ background: "rgba(27,77,228,0.05)", border: "1px solid rgba(27,77,228,0.14)" }}
              >
                <PushPin size={14} weight="fill" color={APROVA.blue} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em]" style={{ color: APROVA.blue }}>
                    Mensagem fixada
                  </p>
                  <p className="text-[12.5px]" style={{ color: APROVA.ink }}>
                    <span className="font-bold">{pinnedMsg.studentName}:</span>{" "}
                    {pinnedMsg.text}
                  </p>
                </div>
                <button
                  onClick={() => setPinnedId(null)}
                  className="mt-0.5 shrink-0 opacity-40 transition-opacity hover:opacity-80"
                >
                  <X size={14} color={APROVA.inkMuted} />
                </button>
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricTile label="Permanência média" value="28:40" icon={Clock} color={APROVA.blue} />
              <MetricTile label="Pico de espectadores" value="79" sub="alunos online" icon={UsersThree} color={APROVA.success} />
              <MetricTile label="Msgs / minuto" value="3,2" sub="média da sessão" icon={ChatCircle} color="#6C4BD9" />
              <MetricTile label="Engaj. na enquete" value="72" sub={`de ${SESSION.enrolled} matriculados`} icon={ChartBar} color={APROVA.streak} />
            </div>

            {/* Teacher controls */}
            <div
              className="flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3"
              style={{ background: "#fff", border: "1px solid #EEF1F7", boxShadow: "0 1px 4px rgba(10,15,30,0.04)" }}
            >
              <p
                className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: APROVA.inkMuted }}
              >
                Controles
              </p>

              <button
                onClick={() => setChatMuted(v => !v)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors"
                style={{
                  background: chatMuted ? "#FDECEC" : "#F4F6FB",
                  color: chatMuted ? APROVA.error : APROVA.inkMuted,
                  border: `1px solid ${chatMuted ? "rgba(226,48,48,0.18)" : "#EEF1F7"}`,
                }}
              >
                {chatMuted
                  ? <><ChatSlash size={14} weight="fill" /> Chat mutado</>
                  : <><ChatCircle size={14} weight="fill" /> Mutar chat</>
                }
              </button>

              <button
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors hover:bg-[#EEF1F7]"
                style={{ background: "#F4F6FB", color: APROVA.inkMuted, border: "1px solid #EEF1F7" }}
                onClick={() => {
                  const lastQ = [...messages].reverse().find(m => m.isQuestion)
                  if (lastQ) setPinnedId(lastQ.id)
                }}
              >
                <PushPin size={14} weight="fill" />
                Fixar última pergunta
              </button>

              <div className="flex-1" />

              <button
                onClick={() => setShowEndConfirm(true)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors"
                style={{ background: "#FDECEC", color: APROVA.error, border: "1px solid rgba(226,48,48,0.18)" }}
              >
                <XCircle size={14} weight="fill" />
                Encerrar transmissão
              </button>
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Audience counter */}
            <BentoCard className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p
                    className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: APROVA.inkMuted }}
                  >
                    Online agora
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="font-display text-[40px] font-bold tabular leading-none"
                      style={{ color: APROVA.ink }}
                    >
                      {audienceNow}
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: APROVA.inkMuted }}>
                      / {SESSION.enrolled} mat.
                    </span>
                  </div>
                  <p className="mt-1 text-[11px]" style={{ color: APROVA.inkMuted }}>
                    {Math.round((audienceNow / SESSION.enrolled) * 100)}% da turma presente
                  </p>
                </div>
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: APROVA.blueSoft }}
                >
                  <Users size={20} weight="fill" color={APROVA.blue} />
                </div>
              </div>
              <GradientAreaChart
                data={audienceHistory}
                color={APROVA.blue}
                height={58}
              />
              <p className="mt-1 text-[10.5px]" style={{ color: APROVA.inkMuted }}>
                Entrada ao longo da transmissão
              </p>
            </BentoCard>

            {/* Poll panel */}
            <BentoCard className="overflow-hidden p-0">
              {/* Poll header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid #EEF1F7" }}
              >
                <div className="flex items-center gap-2">
                  <ChartBar size={15} weight="fill" color={APROVA.streak} />
                  <p className="text-[13px] font-bold" style={{ color: APROVA.ink }}>Enquete</p>
                </div>
                {pollState === "idle" && (
                  <button
                    onClick={() => setPollState("creating")}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors hover:bg-[#DCE4FC]"
                    style={{ background: APROVA.blueSoft, color: APROVA.blue }}
                  >
                    <Plus size={12} weight="bold" />
                    Nova enquete
                  </button>
                )}
                {pollState === "active" && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: "#FFF3DA", color: "#B45309" }}
                  >
                    {POLL.total} responderam
                  </span>
                )}
              </div>

              {/* Poll: empty */}
              {pollState === "idle" && (
                <div className="flex flex-col items-center gap-2 px-4 py-7 text-center">
                  <ChartBar size={28} weight="fill" color="#D8DCE8" />
                  <p className="text-[12px]" style={{ color: APROVA.inkMuted }}>
                    Nenhuma enquete ativa.
                    <br />
                    Crie uma para engajar os alunos.
                  </p>
                </div>
              )}

              {/* Poll: create form */}
              {pollState === "creating" && (
                <div className="flex flex-col gap-2.5 p-4">
                  <input
                    placeholder="Qual é a sua pergunta?"
                    value={pollQuestion}
                    onChange={e => setPollQuestion(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-[12.5px] outline-none focus:border-blue-400"
                    style={{ borderColor: "#DDE1EC", background: "#F4F6FB", color: APROVA.ink }}
                  />
                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      placeholder={`Alternativa ${i + 1}${i >= 2 ? " (opcional)" : ""}`}
                      value={opt}
                      onChange={e => {
                        const next = [...pollOptions]
                        next[i] = e.target.value
                        setPollOptions(next)
                      }}
                      className="w-full rounded-xl border px-3 py-2 text-[12.5px] outline-none focus:border-blue-400"
                      style={{ borderColor: "#DDE1EC", background: "#F4F6FB", color: APROVA.ink }}
                    />
                  ))}
                  <div className="mt-1 flex gap-2">
                    <button
                      onClick={() => setPollState("idle")}
                      className="flex-1 rounded-xl py-2 text-[12px] font-bold transition-colors hover:bg-[#EEF1F7]"
                      style={{ background: "#F4F6FB", color: APROVA.inkMuted }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setPollState("active")}
                      className="flex-1 rounded-xl py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: APROVA.blue }}
                    >
                      Publicar
                    </button>
                  </div>
                </div>
              )}

              {/* Poll: live results */}
              {pollState === "active" && (
                <div className="p-4">
                  <p className="mb-3.5 text-[12.5px] font-bold" style={{ color: APROVA.ink }}>
                    {POLL.question}
                  </p>
                  <div className="flex flex-col gap-3">
                    {POLL.options.map((opt, i) => {
                      const isWinner = opt.pct === maxPollPct
                      const barColor = isWinner ? APROVA.streak : APROVA.blue
                      return (
                        <div key={i}>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p
                              className="min-w-0 truncate text-[11.5px] font-semibold"
                              style={{ color: isWinner ? APROVA.ink : APROVA.inkMuted }}
                            >
                              {opt.label}
                            </p>
                            <span
                              className="shrink-0 text-[11px] font-bold tabular"
                              style={{ color: barColor }}
                            >
                              {opt.pct}%
                            </span>
                          </div>
                          <div
                            className="h-2 w-full overflow-hidden rounded-full"
                            style={{ background: "#EEF1F7" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pollBarWidths[i]}%`,
                                background: barColor,
                                transition: "width 0.85s cubic-bezier(0.22,1,0.36,1)",
                              }}
                            />
                          </div>
                          <p className="mt-0.5 text-[10px]" style={{ color: APROVA.inkMuted }}>
                            {opt.votes} votos
                          </p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>
                      {POLL.total} de {SESSION.enrolled} responderam
                    </p>
                    <button
                      onClick={() => setPollState("idle")}
                      className="text-[11px] font-bold transition-opacity hover:opacity-70"
                      style={{ color: APROVA.error }}
                    >
                      Encerrar enquete
                    </button>
                  </div>
                </div>
              )}
            </BentoCard>

            {/* Chat */}
            <BentoCard className="flex flex-col overflow-hidden p-0" style={{ height: 420 }}>
              {/* Chat header */}
              <div
                className="flex shrink-0 items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid #EEF1F7" }}
              >
                <div className="flex items-center gap-2">
                  <ChatCircle size={15} weight="fill" color="#6C4BD9" />
                  <p className="text-[13px] font-bold" style={{ color: APROVA.ink }}>Chat ao vivo</p>
                </div>
                <span className="text-[11px]" style={{ color: APROVA.inkMuted }}>
                  {messages.length} mensagens
                </span>
              </div>

              {/* Muted banner */}
              {chatMuted && (
                <div
                  className="flex shrink-0 items-center gap-2 px-4 py-2"
                  style={{ background: "#FDECEC", borderBottom: "1px solid rgba(226,48,48,0.18)" }}
                >
                  <ChatSlash size={12} weight="fill" color={APROVA.error} />
                  <p className="text-[11px] font-bold" style={{ color: APROVA.error }}>
                    Chat mutado — alunos não podem enviar mensagens
                  </p>
                </div>
              )}

              {/* Messages */}
              <div
                ref={chatRef}
                className="flex-1 overflow-y-auto px-3 py-3"
                style={{ scrollBehavior: "smooth" }}
              >
                <div className="flex flex-col gap-2.5">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className="group flex items-start gap-2"
                    >
                      <Avatar initial={msg.initial} color={msg.color} size={26} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-bold" style={{ color: msg.color }}>
                            {msg.studentName}
                          </p>
                          {msg.isQuestion && (
                            <span
                              className="rounded-full px-1.5 text-[9px] font-bold"
                              style={{ background: APROVA.blueSoft, color: APROVA.blue }}
                            >
                              ?
                            </span>
                          )}
                          <span className="text-[10px]" style={{ color: APROVA.inkMuted }}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p
                          className="mt-0.5 text-[12px] leading-[1.45]"
                          style={{ color: APROVA.ink }}
                        >
                          {msg.text}
                        </p>
                      </div>
                      <button
                        title="Fixar mensagem"
                        onClick={() => setPinnedId(msg.id)}
                        className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-40 hover:!opacity-80"
                      >
                        <PushPin size={12} color={APROVA.inkMuted} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat input placeholder */}
              {!chatMuted && (
                <div
                  className="shrink-0 px-3 py-2.5"
                  style={{ borderTop: "1px solid #EEF1F7" }}
                >
                  <div
                    className="flex cursor-text items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: "#F4F6FB" }}
                  >
                    <span className="flex-1 select-none text-[12px]" style={{ color: APROVA.inkMuted }}>
                      Responder no chat…
                    </span>
                    <ArrowRight size={14} color={APROVA.blue} />
                  </div>
                </div>
              )}
            </BentoCard>

          </div>
        </div>
      </div>

      {/* ── End stream confirmation modal ────────────────────────────────── */}
      {showEndConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(6,14,39,0.72)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowEndConfirm(false) }}
        >
          <div className="aprova-card mx-auto w-full max-w-[380px] p-6 text-center">
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: "#FDECEC" }}
            >
              <Warning size={24} weight="fill" color={APROVA.error} />
            </div>
            <h3
              className="mb-2 font-display text-[19px] font-bold"
              style={{ color: APROVA.ink }}
            >
              Encerrar transmissão?
            </h3>
            <p className="mb-6 text-[13px]" style={{ color: APROVA.inkMuted }}>
              O aulão será encerrado para todos os{" "}
              <strong style={{ color: APROVA.ink }}>{audienceNow} alunos</strong>{" "}
              online agora. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-colors hover:bg-[#EEF1F7]"
                style={{ background: "#F4F6FB", color: APROVA.inkMuted }}
              >
                Cancelar
              </button>
              <button
                className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: APROVA.error }}
              >
                Sim, encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
