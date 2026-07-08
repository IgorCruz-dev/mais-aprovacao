"use client"

import { useState } from "react"
import {
  PencilLine, Plus, CaretDown, X, ArrowRight, ArrowBendDownRight,
  Highlighter,
} from "@phosphor-icons/react"
import {
  APROVA, MODULES, BentoCard, PageHeader, GoldButton, Chip, ChipRow,
  ProgressBar, StatusBadge, EmptyState,
} from "@/components/student/StudentSurface"
import { ESSAYS, ESSAY_REVIEW, type Essay } from "@/lib/mock-data"

const ESSAY_TYPES = [
  { key: "ENEM", label: "ENEM · 1000" },
  { key: "UFU", label: "UFU · 80" },
  { key: "UEG", label: "UEG · 100" },
  { key: "FUVEST", label: "FUVEST · 50" },
  { key: "VUNESP", label: "VUNESP · 11" },
]

const COMP_COLORS: Record<number, { solid: string; soft: string }> = {
  1: { solid: "#1B4DE4", soft: "rgba(27,77,228,0.16)" },
  2: { solid: "#6C4BD9", soft: "rgba(108,75,217,0.16)" },
  3: { solid: "#0E8A5F", soft: "rgba(14,138,95,0.16)" },
  4: { solid: "#D97706", soft: "rgba(217,119,6,0.18)" },
  5: { solid: "#E23030", soft: "rgba(226,48,48,0.14)" },
}

const scoreColor = (score: number, max: number) => {
  const pct = (score / max) * 100
  return pct >= 70 ? APROVA.success : pct >= 50 ? APROVA.gold : APROVA.error
}

// ─── Detalhe da correção (modal lado a lado) ───────────────────────────────────

function CorrectionModal({ essay, onClose }: { essay: Essay; onClose: () => void }) {
  const review = ESSAY_REVIEW
  const [activeComp, setActiveComp] = useState<number | null>(null)
  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 lg:items-center lg:p-6" onClick={onClose}>
      <div className="flex w-full max-w-5xl flex-col overflow-hidden bg-white lg:max-h-[90vh] lg:rounded-[24px]" onClick={(e) => e.stopPropagation()} style={{ animation: "slideUp 0.25s ease" }}>
        {/* header */}
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "#F1F3F8" }}>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold uppercase" style={{ color: MODULES.redacoes }}>{essay.type} · Correção</span>
            <h2 className="truncate font-display text-[17px] font-extrabold" style={{ color: APROVA.ink }}>{essay.theme}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-display text-[26px] font-bold tabular" style={{ color: scoreColor(essay.score ?? 0, essay.maxScore) }}>{essay.score}</span>
              <span className="text-[12px]" style={{ color: APROVA.inkMuted }}>/{essay.maxScore}</span>
            </div>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#F0F2F7]" style={{ color: APROVA.inkMuted }}><X size={18} /></button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
          {/* texto com grifos */}
          <div className="overflow-y-auto border-r p-5 scrollbar-none" style={{ borderColor: "#F1F3F8" }}>
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: APROVA.inkMuted }}>
              <Highlighter size={13} weight="fill" /> Trechos grifados por competência
            </div>
            <div className="text-[13.5px] leading-[1.9]" style={{ color: APROVA.ink }}>
              {review.paragraphs.map((para, pi) => (
                <p key={pi} className="mb-3">
                  {para.map((seg, si) =>
                    seg.comp ? (
                      <mark
                        key={si}
                        onClick={() => setActiveComp(seg.comp!)}
                        className="cursor-pointer rounded px-0.5 transition-all"
                        style={{ background: COMP_COLORS[seg.comp].soft, color: APROVA.ink, boxShadow: activeComp === seg.comp ? `0 0 0 2px ${COMP_COLORS[seg.comp].solid}` : `inset 0 -2px 0 ${COMP_COLORS[seg.comp].solid}` }}
                      >
                        {seg.text}
                        <sup className="ml-0.5 text-[9px] font-black" style={{ color: COMP_COLORS[seg.comp].solid }}>C{seg.comp}</sup>
                      </mark>
                    ) : (
                      <span key={si}>{seg.text}</span>
                    )
                  )}
                </p>
              ))}
            </div>
          </div>

          {/* painel de competências */}
          <div className="overflow-y-auto p-5 scrollbar-none">
            <div className="flex flex-col gap-3">
              {review.competencies.map((c) => {
                const pct = (c.score / c.max) * 100
                const cc = COMP_COLORS[c.c]
                const active = activeComp === c.c
                return (
                  <div key={c.c} onMouseEnter={() => setActiveComp(c.c)} className="rounded-2xl border p-3.5 transition-all" style={{ borderColor: active ? cc.solid : "#EDF0F6", background: active ? cc.soft : "#fff" }}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-black text-white" style={{ background: cc.solid }}>{c.c}</span>
                        <span className="text-[12.5px] font-extrabold" style={{ color: APROVA.ink }}>{c.name}</span>
                      </div>
                      <span className="font-display text-[15px] font-extrabold tabular" style={{ color: cc.solid }}>{c.score}<span className="text-[11px]" style={{ color: APROVA.inkMuted }}>/{c.max}</span></span>
                    </div>
                    <ProgressBar pct={pct} color={cc.solid} height={5} />
                    <p className="mt-2.5 text-[12px] leading-snug" style={{ color: "#4A5162" }}>{c.comment}</p>

                    {/* antes / depois */}
                    <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: "#EDF0F6" }}>
                      <div className="flex items-start gap-2 px-3 py-2" style={{ background: "#FDECEC" }}>
                        <span className="mt-0.5 text-[9px] font-black uppercase" style={{ color: APROVA.error }}>Antes</span>
                        <p className="text-[11.5px] leading-snug line-through" style={{ color: "#7A5555" }}>{c.before}</p>
                      </div>
                      <div className="flex items-start gap-2 px-3 py-2" style={{ background: "#EAFbF3" }}>
                        <ArrowBendDownRight size={12} weight="bold" color={APROVA.success} className="mt-0.5 shrink-0" />
                        <p className="text-[11.5px] font-semibold leading-snug" style={{ color: APROVA.successDeep }}>{c.after}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card de redação ───────────────────────────────────────────────────────────

function EssayCard({ essay, onOpen }: { essay: Essay; onOpen: () => void }) {
  const graded = essay.score !== undefined
  return (
    <BentoCard hover={graded} onClick={graded ? onOpen : undefined} className="flex flex-col">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase" style={{ background: MODULES.redacoes + "1A", color: MODULES.redacoes }}>{essay.type}</span>
        <StatusBadge status={essay.status} />
        <span className="ml-auto text-[11px]" style={{ color: "#9AA1B0" }}>{essay.date}</span>
      </div>
      <h3 className="font-display text-[15px] font-extrabold leading-tight" style={{ color: APROVA.ink }}>{essay.theme}</h3>
      {graded ? (
        <>
          <div className="mt-3 flex items-end justify-between">
            <span className="font-display text-[36px] font-bold tabular" style={{ color: scoreColor(essay.score!, essay.maxScore) }}>{essay.score}<span className="text-[14px]" style={{ color: APROVA.inkMuted }}>/{essay.maxScore}</span></span>
            <span className="inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: APROVA.blue }}>Ver correção <ArrowRight size={12} weight="bold" /></span>
          </div>
          <div className="mt-2"><ProgressBar pct={(essay.score! / essay.maxScore) * 100} color={scoreColor(essay.score!, essay.maxScore)} height={6} /></div>
        </>
      ) : (
        <p className="mt-3 text-[12px]" style={{ color: APROVA.inkMuted }}>Sua redação está na fila de correção. Retorno em até 5 dias úteis.</p>
      )}
    </BentoCard>
  )
}

export default function RedacoesPage() {
  const [type, setType] = useState("ENEM")
  const [detail, setDetail] = useState<Essay | null>(null)

  const filtered = ESSAYS.filter((e) => e.type === type)

  return (
    <div className="mx-auto max-w-[1080px] px-4 pt-5 lg:px-8 lg:pt-7">
      <PageHeader
        title="Minhas Redações"
        kicker="Correção com IA + antes/depois"
        subtitle="Cada competência vem com um exemplo real de reescrita do seu texto."
        action={<GoldButton><Plus size={16} weight="bold" /> Nova Redação</GoldButton>}
      />

      <div className="mb-4"><ChipRow>{ESSAY_TYPES.map((t) => <Chip key={t.key} active={type === t.key} onClick={() => setType(t.key)} color={MODULES.redacoes}>{t.label}</Chip>)}</ChipRow></div>

      <div className="mb-5 flex gap-2">
        {["Todas as situações", "Mais recentes"].map((l) => (
          <button key={l} className="inline-flex items-center gap-1 rounded-full border border-[#E6E9F0] bg-white px-3 py-1.5 text-[11px] font-bold" style={{ color: APROVA.inkMuted }}>{l} <CaretDown size={12} /></button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={PencilLine} title={`Nenhuma redação ${type} ainda`} text="Escreva agora e receba correção detalhada com nota e reescrita por competência." cta="Escrever agora" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => <EssayCard key={e.id} essay={e} onOpen={() => setDetail(e)} />)}
        </div>
      )}

      {detail && <CorrectionModal essay={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
