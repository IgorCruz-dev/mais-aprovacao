"use client"

import { useState } from "react"
import { Plus, CalendarBlank, GraduationCap, WarningCircle, Briefcase } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, Chip, ChipRow,
  RevealGroup, RevealItem, showToast,
} from "@/components/teacher/TeacherSurface"
import { COMUNICADOS, type ComunicadoCategory, type Comunicado } from "@/lib/mock-teacher-data"

const CATEGORY_MAP: Record<ComunicadoCategory, { Icon: PhosphorIcon; color: string; bg: string; label: string }> = {
  pedagogico:     { Icon: GraduationCap,  color: APROVA.blue,       bg: APROVA.blueSoft,   label: "Pedagógico" },
  administrativo: { Icon: Briefcase,       color: APROVA.inkMuted,   bg: "#F0F2F7",         label: "Administrativo" },
  evento:         { Icon: CalendarBlank,   color: APROVA.goldDeep,   bg: "#FFF3DA",         label: "Evento" },
  urgente:        { Icon: WarningCircle,   color: APROVA.error,      bg: "#FDECEC",         label: "Urgente" },
}

function ComunicadoCard({ com }: { com: Comunicado }) {
  const [expanded, setExpanded] = useState(false)
  const cat = CATEGORY_MAP[com.category]
  const Icon = cat.Icon
  const d = new Date(com.sentAt)
  const dateLabel = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })

  return (
    <div
      className="rounded-2xl p-4 cursor-pointer transition-colors hover:bg-[#F6F7FB]"
      style={{ border: `1px solid ${com.read ? "#EEF1F7" : APROVA.blue}`, background: com.read ? "#fff" : APROVA.blueSoft + "40" }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: cat.bg }}>
          <Icon size={16} weight="fill" color={cat.color} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-bold" style={{ color: APROVA.ink }}>{com.title}</p>
            {!com.read && (
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: APROVA.blue }} />
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-0.5">
            <span className="text-[10.5px] font-semibold" style={{ color: APROVA.inkMuted }}>{com.authorName}</span>
            <span className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>·</span>
            <span className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{dateLabel}</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold mt-1.5" style={{ background: cat.bg, color: cat.color }}>
            {cat.label}
          </span>
        </div>
      </div>
      {expanded && (
        <p className="mt-3 pl-12 text-[13px] leading-relaxed" style={{ color: APROVA.ink }}>{com.body}</p>
      )}
    </div>
  )
}

export default function ComunicadosPage() {
  const [tab, setTab] = useState<"sent" | "received">("received")
  const [categoryFilter, setCategoryFilter] = useState<ComunicadoCategory | "all">("all")

  const filtered = COMUNICADOS
    .filter((c) => tab === "received" ? c.fromCoordination : !c.fromCoordination)
    .filter((c) => categoryFilter === "all" || c.category === categoryFilter)

  const unreadCount = COMUNICADOS.filter((c) => !c.read && c.fromCoordination).length

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Comunicação"
          title="Comunicados"
          subtitle={unreadCount > 0 ? `${unreadCount} não lidos` : "Todos lidos"}
          action={
            <button
              onClick={() => showToast("Novo comunicado — em desenvolvimento")}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-extrabold text-white"
              style={{ background: APROVA.blue }}
            >
              <Plus size={14} weight="bold" /> Novo comunicado
            </button>
          }
        />
      </RevealItem>

      <RevealItem className="mb-4">
        <div className="flex gap-1 rounded-2xl p-1" style={{ background: "#EEF1F7" }}>
          <button
            onClick={() => setTab("received")}
            className="flex-1 rounded-xl px-3 py-2 text-[12.5px] font-bold transition-colors"
            style={{ background: tab === "received" ? "#fff" : "transparent", color: tab === "received" ? APROVA.ink : APROVA.inkMuted }}
          >
            Da coordenação {unreadCount > 0 && <span className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: APROVA.blue, color: "#fff" }}>{unreadCount}</span>}
          </button>
          <button
            onClick={() => setTab("sent")}
            className="flex-1 rounded-xl px-3 py-2 text-[12.5px] font-bold transition-colors"
            style={{ background: tab === "sent" ? "#fff" : "transparent", color: tab === "sent" ? APROVA.ink : APROVA.inkMuted }}
          >
            Meus comunicados
          </button>
        </div>
      </RevealItem>

      <RevealItem className="mb-4">
        <ChipRow>
          <Chip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>Todos</Chip>
          {(Object.entries(CATEGORY_MAP) as [ComunicadoCategory, typeof CATEGORY_MAP[ComunicadoCategory]][]).map(([key, val]) => (
            <Chip key={key} active={categoryFilter === key} onClick={() => setCategoryFilter(key)} color={val.color}>
              {val.label}
            </Chip>
          ))}
        </ChipRow>
      </RevealItem>

      <RevealItem>
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <BentoCard>
              <p className="py-4 text-center text-[13px]" style={{ color: APROVA.inkMuted }}>Nenhum comunicado nesta categoria.</p>
            </BentoCard>
          ) : filtered.map((c) => (
            <ComunicadoCard key={c.id} com={c} />
          ))}
        </div>
      </RevealItem>
    </RevealGroup>
  )
}
