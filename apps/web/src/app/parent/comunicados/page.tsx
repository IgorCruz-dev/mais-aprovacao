"use client"

import { useState } from "react"
import {
  CalendarBlank,
  CurrencyDollarSimple,
  GraduationCap,
  Headset,
  Megaphone,
} from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { MOCK_ANNOUNCEMENTS } from "@/lib/mock-parent-data"
import type { AnnouncementCategory } from "@/lib/mock-parent-data"
import {
  APROVA,
  BentoCard,
  Chip,
  ChipRow,
  PageHeader,
  RevealGroup,
  RevealItem,
} from "@/components/student/StudentSurface"

const CATEGORY_CONFIG: Record<AnnouncementCategory, { Icon: PhosphorIcon; color: string; bg: string; label: string }> = {
  pedagogico: { Icon: GraduationCap, color: APROVA.blue,        bg: APROVA.blueSoft, label: "Pedagógico" },
  financeiro:  { Icon: CurrencyDollarSimple, color: "#0A8754",  bg: "#E6F8F0",       label: "Financeiro" },
  evento:      { Icon: CalendarBlank, color: "#D97706",         bg: "#FFF3DA",       label: "Evento" },
  suporte:     { Icon: Headset,       color: APROVA.inkMuted,   bg: "#F0F2F7",       label: "Suporte" },
}

export default function ParentComunicadosPage() {
  const [categoryFilter, setCategoryFilter] = useState<AnnouncementCategory | "todos">("todos")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(MOCK_ANNOUNCEMENTS.filter((a) => a.read).map((a) => a.id))
  )

  const filtered =
    categoryFilter === "todos"
      ? MOCK_ANNOUNCEMENTS
      : MOCK_ANNOUNCEMENTS.filter((a) => a.category === categoryFilter)

  const unreadCount = MOCK_ANNOUNCEMENTS.filter((a) => !readIds.has(a.id)).length

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
    setReadIds((prev) => new Set([...prev, id]))
  }

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Área do responsável"
          title="Comunicados"
          subtitle={
            unreadCount > 0
              ? `${unreadCount} comunicado${unreadCount > 1 ? "s" : ""} não lido${unreadCount > 1 ? "s" : ""}`
              : "Todos os comunicados lidos."
          }
        />
      </RevealItem>

      <RevealItem className="mb-4">
        <ChipRow>
          <Chip active={categoryFilter === "todos"} onClick={() => setCategoryFilter("todos")}>
            Todos
          </Chip>
          {(Object.keys(CATEGORY_CONFIG) as AnnouncementCategory[]).map((cat) => (
            <Chip key={cat} active={categoryFilter === cat} onClick={() => setCategoryFilter(cat)}>
              {CATEGORY_CONFIG[cat].label}
            </Chip>
          ))}
        </ChipRow>
      </RevealItem>

      <RevealItem>
        <BentoCard className="p-0 overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-5 text-[13px]" style={{ color: APROVA.inkMuted }}>Nenhum comunicado nesta categoria.</p>
          ) : (
            filtered.map((ann, i) => {
              const conf = CATEGORY_CONFIG[ann.category]
              const Icon = conf.Icon
              const isRead = readIds.has(ann.id)
              const isOpen = expanded === ann.id

              return (
                <button
                  key={ann.id}
                  className="w-full text-left"
                  onClick={() => toggleExpand(ann.id)}
                  style={{ borderTop: i > 0 ? `1px solid #F1F3F8` : undefined }}
                >
                  <div className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[#FAFBFD]">
                    {/* Icon */}
                    <div
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: conf.bg }}
                    >
                      <Icon size={16} weight="fill" color={conf.color} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-[13.5px] leading-snug"
                          style={{
                            color: APROVA.ink,
                            fontWeight: isRead ? 500 : 700,
                          }}
                        >
                          {ann.title}
                        </p>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {!isRead && (
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: APROVA.blue }}
                            />
                          )}
                          <span className="text-[11px]" style={{ color: APROVA.inkMuted }}>
                            {ann.date}
                          </span>
                        </div>
                      </div>

                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
                          style={{ background: conf.bg, color: conf.color }}
                        >
                          {conf.label}
                        </span>
                        {!isOpen && (
                          <p className="truncate text-[12px]" style={{ color: APROVA.inkMuted }}>
                            {ann.body.slice(0, 80)}…
                          </p>
                        )}
                      </div>

                      {isOpen && (
                        <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: APROVA.inkMuted }}>
                          {ann.body}
                        </p>
                      )}
                    </div>

                    {/* Caret */}
                    <Megaphone
                      size={14}
                      weight="fill"
                      color={APROVA.inkMuted}
                      className="mt-1 shrink-0 opacity-30"
                      style={{ transform: isOpen ? "rotate(90deg)" : undefined, transition: "transform 0.15s" }}
                    />
                  </div>
                </button>
              )
            })
          )}
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
