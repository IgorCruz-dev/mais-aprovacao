"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play, Pause, Check, VideoCamera, CaretDown,
  TextAlignLeft, NotePencil, Paperclip, FilePdf, FileImage,
  Cards, SkipForward,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  APROVA, MODULES, BentoCard, PageHeader, ProgressBar, showToast,
} from "@/components/student/StudentSurface"
import { CURRENT_LESSON, LESSON_MODULES, LESSON_TRANSCRIPT, LESSON_NOTES, LESSON_MATERIALS } from "@/lib/mock-data"

const AULA_COLOR = MODULES.aulas
const SPEEDS = [0.75, 1, 1.25, 1.5, 2]
const DURATION = 600 // segundos simulados

type Tab = "transcricao" | "anotacoes" | "material"

// ─── Player ────────────────────────────────────────────────────────────────────

function Player({ playing, onToggle, current }: { playing: boolean; onToggle: () => void; current: number }) {
  const pct = Math.min(100, (current / DURATION) * 100)
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${AULA_COLOR}, ${APROVA.navy})` }}>
      <div className="aprova-halftone pointer-events-none absolute inset-0 opacity-50" />
      <button onClick={onToggle} className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 backdrop-blur transition-transform hover:scale-105">
          {playing ? <Pause size={28} weight="fill" color="#fff" /> : <Play size={28} weight="fill" color="#fff" className="ml-1" />}
        </div>
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#fff" }} />
        </div>
      </div>
    </div>
  )
}

// ─── Transcrição com auto-scroll ───────────────────────────────────────────────

function TranscriptPanel({ current, onSeek }: { current: number; onSeek: (s: number) => void }) {
  const activeIdx = (() => {
    let idx = 0
    LESSON_TRANSCRIPT.forEach((l, i) => { if (current >= l.seconds) idx = i })
    return idx
  })()
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [activeIdx])
  return (
    <div ref={containerRef} className="flex max-h-[320px] flex-col gap-1 overflow-y-auto scrollbar-none pr-1">
      {LESSON_TRANSCRIPT.map((line, i) => {
        const active = i === activeIdx
        return (
          <button
            key={line.time}
            ref={active ? activeRef : undefined}
            onClick={() => onSeek(line.seconds)}
            className="flex items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors"
            style={{ background: active ? APROVA.blueSoft : "transparent" }}
          >
            <span className="mt-0.5 shrink-0 text-[11px] font-bold tabular" style={{ color: active ? APROVA.blue : "#9AA1B0" }}>{line.time}</span>
            <span className="text-[13px] leading-snug" style={{ color: active ? APROVA.ink : APROVA.inkMuted, fontWeight: active ? 600 : 400 }}>{line.text}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Anotações → flashcard ─────────────────────────────────────────────────────

function NotesPanel({ onSeek }: { onSeek: (s: number) => void }) {
  const [notes, setNotes] = useState(LESSON_NOTES)
  const [draft, setDraft] = useState("")
  const promote = (id: string) => {
    setNotes((n) => n.map((x) => (x.id === id ? { ...x, flashcard: true } : x)))
    showToast("Anotação virou flashcard de revisão", "🃏")
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Anotar no minuto atual…" className="flex-1 rounded-xl border border-[#E6E9F0] bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-[#1B4DE4]" />
        <button onClick={() => { if (draft) { setNotes((n) => [...n, { id: `n${Date.now()}`, time: "05:00", seconds: 300, text: draft, flashcard: false }]); setDraft(""); showToast("Anotação salva", "📝") } }} className="rounded-xl px-4 text-[13px] font-extrabold text-white" style={{ background: AULA_COLOR }}>Salvar</button>
      </div>
      {notes.map((n) => (
        <div key={n.id} className="rounded-2xl border border-[#EDF0F6] p-3">
          <button onClick={() => onSeek(n.seconds)} className="mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular" style={{ background: APROVA.blueSoft, color: APROVA.blue }}>▶ {n.time}</button>
          <p className="text-[13px] leading-snug" style={{ color: APROVA.ink }}>{n.text}</p>
          {n.flashcard ? (
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: APROVA.success }}><Check size={12} weight="bold" /> Flashcard criado</span>
          ) : (
            <button onClick={() => promote(n.id)} className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-bold" style={{ color: APROVA.blue }}>
              <Cards size={14} weight="fill" /> Transformar em flashcard
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Material de apoio ─────────────────────────────────────────────────────────

function MaterialPanel() {
  return (
    <div className="flex flex-col gap-2">
      {LESSON_MATERIALS.map((m) => {
        const Icon = m.kind === "PDF" ? FilePdf : FileImage
        return (
          <button key={m.id} onClick={() => showToast("Download iniciado", "⬇️")} className="flex items-center gap-3 rounded-2xl border border-[#EDF0F6] p-3 text-left transition-colors hover:bg-[#F6F7FB]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: m.kind === "PDF" ? "#FDECEC" : APROVA.blueSoft }}>
              <Icon size={20} weight="duotone" color={m.kind === "PDF" ? APROVA.error : APROVA.blue} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold" style={{ color: APROVA.ink }}>{m.name}</p>
              <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>{m.kind} · {m.size}</p>
            </div>
            <Paperclip size={16} color="#C4CAD6" />
          </button>
        )
      })}
    </div>
  )
}

// ─── Sidebar de módulos ────────────────────────────────────────────────────────

function ModulesSidebar({ activeId }: { activeId: string }) {
  const [open, setOpen] = useState<string | null>(LESSON_MODULES[0].title)
  return (
    <BentoCard className="p-3">
      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>Conteúdo do curso</p>
      <div className="flex flex-col gap-1">
        {LESSON_MODULES.map((mod) => {
          const isOpen = open === mod.title
          const doneCount = mod.lessons.filter((l) => l.status === "Concluída").length
          const pct = (doneCount / mod.lessons.length) * 100
          return (
            <div key={mod.title}>
              <button onClick={() => setOpen(isOpen ? null : mod.title)} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-left hover:bg-[#F6F7FB]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: mod.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-extrabold" style={{ color: APROVA.ink }}>{mod.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#EEF1F7]"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: mod.color }} /></div>
                    <span className="text-[10px] tabular" style={{ color: APROVA.inkMuted }}>{doneCount}/{mod.lessons.length}</span>
                  </div>
                </div>
                <CaretDown size={14} color={APROVA.inkMuted} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {isOpen && (
                <div className="ml-1 flex flex-col gap-0.5 border-l-2 pl-2" style={{ borderColor: "#F1F3F8" }}>
                  {mod.lessons.map((l) => {
                    const active = l.id === activeId
                    return (
                      <button key={l.id} className="flex items-center gap-2 rounded-lg px-2 py-2 text-left" style={{ background: active ? APROVA.blueSoft : "transparent" }}>
                        {l.status === "Concluída" ? <Check size={15} weight="bold" color={APROVA.success} className="shrink-0" />
                          : l.status === "Em andamento" ? <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: mod.color }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: mod.color }} /></span>
                          : <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2" style={{ borderColor: "#D8DCE6" }} />}
                        <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: active ? APROVA.ink : APROVA.inkMuted, fontWeight: active ? 700 : 500 }}>{l.title}</span>
                        <span className="shrink-0 text-[10px] tabular" style={{ color: "#B4BAC7" }}>{l.duration}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </BentoCard>
  )
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default function AulasPage() {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(258)
  const [speed, setSpeed] = useState(1)
  const [tab, setTab] = useState<Tab>("transcricao")
  const [completed, setCompleted] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setCurrent((c) => Math.min(DURATION, c + speed)), 1000)
    return () => clearInterval(t)
  }, [playing, speed])

  const tabs: { key: Tab; label: string; icon: PhosphorIcon }[] = [
    { key: "transcricao", label: "Transcrição", icon: TextAlignLeft },
    { key: "anotacoes", label: "Anotações", icon: NotePencil },
    { key: "material", label: "Material de apoio", icon: Paperclip },
  ]

  const overallPct = 42

  const panel = (
    <>
      {tab === "transcricao" && <TranscriptPanel current={current} onSeek={setCurrent} />}
      {tab === "anotacoes" && <NotesPanel onSeek={setCurrent} />}
      {tab === "material" && <MaterialPanel />}
    </>
  )

  return (
    <div className="mx-auto max-w-[1240px] px-4 pt-5 lg:px-8 lg:pt-7">
      <PageHeader title="Aulas" kicker="Curso extensivo ENEM" action={
        <div className="hidden items-center gap-2.5 sm:flex">
          <div className="w-32"><ProgressBar pct={overallPct} color={AULA_COLOR} height={7} /></div>
          <span className="text-[12px] font-bold tabular" style={{ color: APROVA.ink }}>{overallPct}% do curso</span>
        </div>
      } />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* main */}
        <div className="lg:col-span-8">
          <BentoCard>
            <Player playing={playing} onToggle={() => setPlaying((p) => !p)} current={current} />

            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase" style={{ background: AULA_COLOR + "16", color: AULA_COLOR }}><VideoCamera size={12} weight="fill" /> Videoaula</span>
                <h2 className="mt-2 font-display text-[20px] font-extrabold leading-tight" style={{ color: APROVA.ink }}>{CURRENT_LESSON.title}</h2>
                <p className="mt-0.5 text-[12px]" style={{ color: APROVA.inkMuted }}>Aula {CURRENT_LESSON.lesson} de {CURRENT_LESSON.totalLessons} · {CURRENT_LESSON.professor}</p>
              </div>
            </div>

            {/* controles */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: "#F1F3F8" }}>
              <div className="flex items-center gap-1 rounded-full bg-[#EEF1F7] p-1">
                {SPEEDS.map((sp) => (
                  <button key={sp} onClick={() => setSpeed(sp)} className="rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors" style={{ background: speed === sp ? "#fff" : "transparent", color: speed === sp ? APROVA.blue : APROVA.inkMuted }}>{sp}x</button>
                ))}
              </div>
              <button className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#E6E9F0] px-3.5 py-2 text-[12px] font-bold" style={{ color: APROVA.ink }}><SkipForward size={14} weight="fill" /> Próxima aula</button>
              <button onClick={() => { setCompleted((c) => !c); if (!completed) showToast("Aula concluída!", "✅") }} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-extrabold text-white" style={{ background: completed ? APROVA.success : APROVA.ink }}>
                <Check size={14} weight="bold" /> {completed ? "Concluída" : "Marcar concluída"}
              </button>
            </div>

            {/* tabs — desktop inline */}
            <div className="hidden lg:block">
              <div className="mt-4 flex gap-1 border-b" style={{ borderColor: "#F1F3F8" }}>
                {tabs.map((t) => (
                  <button key={t.key} onClick={() => setTab(t.key)} className="flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[12.5px] font-bold transition-colors" style={{ borderColor: tab === t.key ? APROVA.blue : "transparent", color: tab === t.key ? APROVA.blue : APROVA.inkMuted }}>
                    <t.icon size={15} weight={tab === t.key ? "fill" : "regular"} /> {t.label}
                  </button>
                ))}
              </div>
              <div className="mt-4">{panel}</div>
            </div>

            {/* tabs — mobile: botões que abrem bottom sheet */}
            <div className="mt-4 grid grid-cols-3 gap-2 lg:hidden">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => { setTab(t.key); setSheetOpen(true) }} className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl border border-[#EDF0F6] px-2 py-2" style={{ color: APROVA.ink }}>
                  <t.icon size={18} weight="duotone" color={APROVA.blue} />
                  <span className="text-[11px] font-bold leading-tight">{t.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </BentoCard>
        </div>

        {/* sidebar */}
        <div className="lg:col-span-4"><ModulesSidebar activeId="l03" /></div>
      </div>

      {/* bottom sheet (mobile) */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden" onClick={() => setSheetOpen(false)}>
          <div className="flex max-h-[82vh] w-full flex-col rounded-t-[24px] bg-white" onClick={(e) => e.stopPropagation()} style={{ animation: "slideUp 0.28s ease" }}>
            <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[#E6E9F0]" />
            <div className="flex shrink-0 gap-1 border-b px-4 pt-3" style={{ borderColor: "#F1F3F8" }}>
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)} className="flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[12.5px] font-bold" style={{ borderColor: tab === t.key ? APROVA.blue : "transparent", color: tab === t.key ? APROVA.blue : APROVA.inkMuted }}>
                  <t.icon size={15} weight={tab === t.key ? "fill" : "regular"} /> {t.label.split(" ")[0]}
                </button>
              ))}
              <button onClick={() => setSheetOpen(false)} className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg" style={{ color: APROVA.inkMuted }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pb-8 scrollbar-none">{panel}</div>
          </div>
        </div>
      )}
    </div>
  )
}
