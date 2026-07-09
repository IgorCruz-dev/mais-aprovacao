"use client"

import { Plus, VideoCamera, PencilLine, Exam, UsersThree, ChalkboardTeacher, Clock } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, NavyCard, SectionTitle,
  RevealGroup, RevealItem, showToast, KpiCard, AnimatedNumber,
} from "@/components/teacher/TeacherSurface"
import { AGENDA_ITEMS, type AgendaItem, type AgendaItemType } from "@/lib/mock-teacher-data"

const TYPE_CONFIG: Record<AgendaItemType, { Icon: PhosphorIcon; color: string; bg: string; label: string }> = {
  aula:     { Icon: VideoCamera,         color: APROVA.blue,       bg: APROVA.blueSoft,  label: "Aula" },
  simulado: { Icon: Exam,                color: "#D97706",          bg: "#FFF3DA",        label: "Simulado" },
  reuniao:  { Icon: UsersThree,          color: APROVA.goldDeep,   bg: "#FFF3DA",        label: "Reunião" },
  correcao: { Icon: PencilLine,          color: "#6C4BD9",          bg: "#F0ECFF",        label: "Correção" },
  plantao:  { Icon: ChalkboardTeacher,   color: APROVA.success,    bg: "#E6F8F0",        label: "Plantão" },
}

const DAY_LABELS: Record<number, string> = {
  0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb",
}

function groupByDate(items: AgendaItem[]): Map<string, AgendaItem[]> {
  const map = new Map<string, AgendaItem[]>()
  items
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .forEach((item) => {
      if (!map.has(item.date)) map.set(item.date, [])
      map.get(item.date)!.push(item)
    })
  return map
}

function AgendaRow({ item, isLast }: { item: AgendaItem; isLast: boolean }) {
  const cfg = TYPE_CONFIG[item.type]
  const Icon = cfg.Icon
  const cancelled = item.status === "cancelado"

  return (
    <div
      className="flex items-center gap-3 py-2.5"
      style={{ borderBottom: !isLast ? "1px solid #F1F3F8" : undefined, opacity: cancelled ? 0.5 : 1 }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: cfg.bg }}>
        <Icon size={16} weight="fill" color={cfg.color} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-bold" style={{ color: APROVA.ink, textDecoration: cancelled ? "line-through" : undefined }}>
          {item.title}
        </p>
        <div className="flex flex-wrap gap-1.5 text-[10.5px]" style={{ color: APROVA.inkMuted }}>
          <span className="flex items-center gap-1"><Clock size={10} />{item.time}</span>
          <span>·</span>
          <span>{item.durationMin}min</span>
          {item.turmaNome && <><span>·</span><span>{item.turmaNome}</span></>}
        </div>
        {item.notes && <p className="text-[10.5px] mt-0.5" style={{ color: APROVA.inkMuted }}>{item.notes}</p>}
      </div>
      <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  )
}

export default function AgendaPage() {
  const upcoming = AGENDA_ITEMS.filter((a) => a.status === "pendente")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  const grouped = groupByDate(upcoming)

  const aulasCount = upcoming.filter((a) => a.type === "aula").length
  const correcaoCount = upcoming.filter((a) => a.type === "correcao").length
  const simuladosCount = upcoming.filter((a) => a.type === "simulado").length
  const reuniaoCount = upcoming.filter((a) => a.type === "reuniao").length

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Organização"
          title="Agenda"
          subtitle={`${upcoming.length} compromissos pendentes`}
          action={
            <button
              onClick={() => showToast("Adicionar evento — em desenvolvimento")}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-extrabold text-white"
              style={{ background: APROVA.blue }}
            >
              <Plus size={14} weight="bold" /> Adicionar
            </button>
          }
        />
      </RevealItem>

      <RevealItem className="mb-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <KpiCard label="Aulas" value={<AnimatedNumber value={aulasCount} />} icon={VideoCamera} color={APROVA.blue} />
          <KpiCard label="Correções" value={<AnimatedNumber value={correcaoCount} />} icon={PencilLine} color="#6C4BD9" />
          <KpiCard label="Simulados" value={<AnimatedNumber value={simuladosCount} />} icon={Exam} color="#D97706" />
          <KpiCard label="Reuniões" value={<AnimatedNumber value={reuniaoCount} />} icon={UsersThree} color={APROVA.goldDeep} />
        </div>
      </RevealItem>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-5">
        <RevealItem>
          <div className="flex flex-col gap-4">
            {Array.from(grouped.entries()).map(([date, items]) => {
              const d = new Date(`${date}T12:00:00`)
              const dayName = DAY_LABELS[d.getDay()]
              const dateLabel = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })
              const isToday = date === "2026-07-08"

              return (
                <BentoCard key={date}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="font-display text-[13px] font-bold" style={{ color: isToday ? APROVA.blue : APROVA.ink }}>
                      {dayName}, {dateLabel}
                    </span>
                    {isToday && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: APROVA.blue, color: "#fff" }}>Hoje</span>
                    )}
                  </div>
                  <div>
                    {items.map((item, i) => (
                      <AgendaRow key={item.id} item={item} isLast={i === items.length - 1} />
                    ))}
                  </div>
                </BentoCard>
              )
            })}
            {grouped.size === 0 && (
              <BentoCard>
                <p className="py-4 text-center text-[13px]" style={{ color: APROVA.inkMuted }}>Nenhum compromisso pendente.</p>
              </BentoCard>
            )}
          </div>
        </RevealItem>

        <div className="flex flex-col gap-4">
          <RevealItem>
            <NavyCard halftone="gold">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: APROVA.gold }}>Esta semana</p>
              <div className="mt-3 flex flex-col gap-2">
                {upcoming.slice(0, 5).map((item) => {
                  const cfg = TYPE_CONFIG[item.type]
                  const Icon = cfg.Icon
                  const d = new Date(`${item.date}T${item.time}`)
                  return (
                    <div key={item.id} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <Icon size={14} weight="fill" color={cfg.color} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-bold text-white">{item.title}</p>
                        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {item.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </NavyCard>
          </RevealItem>

          <RevealItem>
            <BentoCard>
              <SectionTitle title="Concluídos recentemente" kicker="Histórico" />
              <div className="flex flex-col">
                {AGENDA_ITEMS.filter((a) => a.status === "concluido").map((item, i) => {
                  const cfg = TYPE_CONFIG[item.type]
                  const Icon = cfg.Icon
                  return (
                    <div key={item.id} className="flex items-center gap-2.5 py-2" style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
                      <Icon size={14} weight="fill" color={APROVA.success} />
                      <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold" style={{ color: APROVA.inkMuted }}>{item.title}</p>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: "#E6F8F0", color: APROVA.successDeep }}>Feito</span>
                    </div>
                  )
                })}
              </div>
            </BentoCard>
          </RevealItem>
        </div>
      </div>
    </RevealGroup>
  )
}
