"use client"

import { useState } from "react"
import {
  Trophy, Crown, CaretDown, TrendUp, TrendDown, Minus,
  CaretUp, CaretDown as CaretDownIcon, Target,
} from "@phosphor-icons/react"
import {
  APROVA, BentoCard, NavyCard, PageHeader, MilestoneBar,
  SectionTitle, Avatar, Medal,
} from "@/components/student/StudentSurface"
import { STUDENT, RANKING_PODIUM, RANKING_NEIGHBORS, RANKING_HISTORY, RACE, RACE_MILESTONES } from "@/lib/mock-data"

// ─── Pódio ─────────────────────────────────────────────────────────────────────

function Podium() {
  const [first, second, third] = RANKING_PODIUM
  const Col = ({ p, place, h, big }: { p: typeof RANKING_PODIUM[0]; place: 1 | 2 | 3; h: number; big?: boolean }) => (
    <div className="flex flex-1 flex-col items-center justify-end gap-2">
      {place === 1 && <Crown size={26} weight="fill" color={APROVA.gold} style={{ animation: "floatY 3s ease-in-out infinite" }} />}
      <div className="relative">
        <Avatar initial={p.initial} color={p.color} size={big ? 62 : 48} ring={place === 1 ? APROVA.gold : place === 2 ? "#B9C2CF" : "#CD8246"} />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2"><Medal place={place} size={big ? 24 : 20} /></div>
      </div>
      <div className="mt-1 text-center">
        <p className="text-[13px] font-extrabold text-white">{p.name}</p>
        <p className="text-[12px] font-bold tabular" style={{ color: APROVA.gold }}>{p.pts} pts</p>
      </div>
      <div className="w-full rounded-t-xl" style={{ height: h, background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))", borderTop: `2px solid ${place === 1 ? APROVA.gold : "rgba(255,255,255,0.2)"}` }} />
    </div>
  )
  return (
    <NavyCard halftone="gold">
      <div className="mx-auto flex max-w-md items-end gap-3 px-2 pt-4">
        <Col p={second} place={2} h={64} />
        <Col p={first} place={1} h={92} big />
        <Col p={third} place={3} h={46} />
      </div>
    </NavyCard>
  )
}

// ─── Concorrentes diretos ──────────────────────────────────────────────────────

function DirectRivals() {
  const [above, me, below] = RANKING_NEIGHBORS
  const gapUp = above.pts - me.pts
  const gapDown = me.pts - below.pts
  return (
    <BentoCard>
      <SectionTitle title="Seus concorrentes diretos" kicker="Quem está ao seu alcance" />
      <div className="flex flex-col gap-2">
        <RivalRow n={above} note={`${gapUp} pts acima`} noteColor={APROVA.error} arrow="up" />
        <RivalRow n={me} highlight />
        <RivalRow n={below} note={`${gapDown} pts abaixo`} noteColor={APROVA.success} arrow="down" />
      </div>
      <p className="mt-3 text-[12px] leading-snug" style={{ color: APROVA.inkMuted }}>
        Você precisa de só <span className="font-extrabold" style={{ color: APROVA.blue }}>{gapUp} pts</span> para ultrapassar {above.name.split(" ")[0]}. Uma redação já resolve.
      </p>
    </BentoCard>
  )
}

function RivalRow({ n, note, noteColor, arrow, highlight }: { n: typeof RANKING_NEIGHBORS[0]; note?: string; noteColor?: string; arrow?: "up" | "down"; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: highlight ? APROVA.blueSoft : "#F6F7FB", border: highlight ? `1.5px solid ${APROVA.blue}` : "1.5px solid transparent" }}>
      <span className="w-8 text-center font-display text-[15px] font-black tabular" style={{ color: highlight ? APROVA.blue : APROVA.inkMuted }}>#{n.rank}</span>
      <Avatar initial={n.initial} color={n.color} size={34} ring={highlight ? APROVA.gold : undefined} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-extrabold" style={{ color: APROVA.ink }}>{n.name}{highlight && <span className="font-semibold" style={{ color: APROVA.blue }}> (você)</span>}</p>
        {note && (
          <p className="flex items-center gap-1 text-[11px] font-bold" style={{ color: noteColor }}>
            {arrow === "up" ? <CaretUp size={11} weight="bold" /> : <CaretDownIcon size={11} weight="bold" />} {note}
          </p>
        )}
      </div>
      <span className="font-display text-[16px] font-extrabold tabular" style={{ color: highlight ? APROVA.blue : APROVA.ink }}>{n.pts}</span>
    </div>
  )
}

// ─── Corrida para o topo ───────────────────────────────────────────────────────

function RaceToTop() {
  const remaining = RACE.leaderPts - RACE.points
  return (
    <NavyCard halftone="gold" className="flex flex-col justify-center">
      <div className="mb-1 flex items-center gap-2">
        <Target size={16} weight="fill" color={APROVA.gold} />
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: APROVA.gold }}>Corrida para o topo</p>
      </div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="font-display text-[44px] font-bold tabular text-white">{RACE.points}</span>
        <span className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>/ {RACE.leaderPts} pts</span>
      </div>
      <MilestoneBar value={RACE.points} target={RACE.leaderPts} milestones={RACE_MILESTONES.filter((m) => m.at <= RACE.leaderPts)} />
      <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.65)" }}>Faltam <span className="font-extrabold text-white">{remaining} pts</span> para o 1º lugar.</p>
    </NavyCard>
  )
}

// ─── Histórico ─────────────────────────────────────────────────────────────────

function History() {
  return (
    <BentoCard>
      <SectionTitle title="Seu histórico" />
      <div className="flex flex-col">
        {RANKING_HISTORY.map((h, i) => {
          const up = h.delta !== null && h.delta > 0
          const down = h.delta !== null && h.delta < 0
          return (
            <div key={h.month} className="flex items-center gap-3 py-3" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: up ? "#E6F8F0" : down ? "#FDECEC" : "#F0F2F7" }}>
                {up ? <TrendUp size={17} weight="bold" color={APROVA.success} /> : down ? <TrendDown size={17} weight="bold" color={APROVA.error} /> : <Minus size={17} color={APROVA.inkMuted} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-extrabold" style={{ color: APROVA.ink }}>{h.month}</p>
                <p className="text-[11px]" style={{ color: APROVA.inkMuted }}>{h.identity}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-extrabold tabular" style={{ color: APROVA.ink }}>#{h.rank}</p>
                {h.delta !== null && (
                  <p className="text-[11px] font-bold tabular" style={{ color: up ? APROVA.success : APROVA.error }}>{up ? "+" : ""}{h.delta} pts</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </BentoCard>
  )
}

export default function RankingPage() {
  const [period, setPeriod] = useState("Julho 2026")
  return (
    <div className="mx-auto max-w-[1080px] px-4 pt-5 lg:px-8 lg:pt-7">
      <PageHeader
        title="Ranking"
        kicker="Competição mensal"
        action={
          <button className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E9F0] bg-white px-3.5 py-2 text-[12px] font-bold" style={{ color: APROVA.ink }}>
            {period} <CaretDown size={13} />
          </button>
        }
      />

      <div className="mb-4"><Podium /></div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DirectRivals />
        <RaceToTop />
      </div>

      <div className="mt-4"><History /></div>
    </div>
  )
}
