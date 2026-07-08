"use client"

import { useMemo, useState } from "react"
import { VideoCamera, Users, Exam, UsersThree, Buildings } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, ChipRow, Chip, Avatar,
  DataTable, ManagerStatusBadge, type DataTableColumn,
} from "@/components/manager/ManagerSurface"
import { MANAGER_EVENTS, EVENT_TYPE_LABELS, type ManagerEvent, type EventType } from "@/lib/mock-manager-data"

const STATUSES: { value: ManagerEvent["status"] | "all"; label: string }[] = [
  { value: "all", label: "Todos os status" },
  { value: "scheduled", label: "Agendado" },
  { value: "live", label: "Ao vivo" },
  { value: "ended", label: "Encerrado" },
  { value: "cancelled", label: "Cancelado" },
]

const TYPES: { value: EventType | "all"; label: string }[] = [
  { value: "all", label: "Todos os tipos" },
  { value: "aulao", label: EVENT_TYPE_LABELS.aulao },
  { value: "simulado_presencial", label: EVENT_TYPE_LABELS.simulado_presencial },
  { value: "reuniao_pais", label: EVENT_TYPE_LABELS.reuniao_pais },
  { value: "evento_institucional", label: EVENT_TYPE_LABELS.evento_institucional },
]

const TYPE_ICONS: Record<EventType, PhosphorIcon> = {
  aulao: VideoCamera,
  simulado_presencial: Exam,
  reuniao_pais: UsersThree,
  evento_institucional: Buildings,
}

function formatEventDateTime(iso: string) {
  const date = new Date(iso)
  return {
    date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  }
}

export default function ManagerEventosPage() {
  const [status, setStatus] = useState<ManagerEvent["status"] | "all">("all")
  const [type, setType] = useState<EventType | "all">("all")

  const sorted = useMemo(
    () => [...MANAGER_EVENTS].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
    []
  )
  const filtered = useMemo(
    () => sorted.filter((e) => (status === "all" || e.status === status) && (type === "all" || e.type === type)),
    [sorted, status, type]
  )

  const columns: DataTableColumn<ManagerEvent>[] = [
    {
      key: "title",
      header: "Evento",
      render: (row) => {
        const Icon = TYPE_ICONS[row.type]
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: APROVA.blueSoft }}>
              <Icon size={15} weight="duotone" color={APROVA.blue} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{row.title}</p>
              <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{EVENT_TYPE_LABELS[row.type]} · {row.audience}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: "teacher",
      header: "Responsável",
      render: (row) =>
        row.teacherName ? (
          <div className="flex items-center gap-2">
            <Avatar initial={row.teacherName[0]} size={26} color={APROVA.blueBright} />
            <span className="font-semibold" style={{ color: APROVA.ink }}>{row.teacherName}</span>
          </div>
        ) : (
          <span style={{ color: APROVA.inkMuted }}>Coordenação</span>
        ),
    },
    {
      key: "when",
      header: "Data e hora",
      render: (row) => {
        const { date, time } = formatEventDateTime(row.scheduledAt)
        return (
          <span style={{ color: APROVA.inkMuted }}>
            {date} <span className="font-bold" style={{ color: APROVA.ink }}>{time}</span>
          </span>
        )
      },
    },
    { key: "status", header: "Status", render: (row) => <ManagerStatusBadge domain="event" status={row.status} /> },
    {
      key: "attendance",
      header: "Presença",
      render: (row) => (
        <span className="inline-flex items-center gap-1 tabular" style={{ color: APROVA.ink }}>
          <Users size={13} color={APROVA.inkMuted} />
          {row.attendeesCount !== null ? `${row.attendeesCount} / ${row.attendeesExpected}` : `— / ${row.attendeesExpected} esperados`}
        </span>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-[1680px] px-4 pt-4 lg:px-8 lg:pt-7">
      <PageHeader kicker="Gestão" title="Eventos" subtitle="Aulões e outros eventos esporádicos, com hora marcada, para as turmas" />

      <div className="mb-4 flex flex-col gap-2">
        <ChipRow>
          {TYPES.map((t) => (
            <Chip key={t.value} active={type === t.value} onClick={() => setType(t.value)}>{t.label}</Chip>
          ))}
        </ChipRow>
        <ChipRow>
          {STATUSES.map((s) => (
            <Chip key={s.value} active={status === s.value} onClick={() => setStatus(s.value)}>{s.label}</Chip>
          ))}
        </ChipRow>
      </div>

      <BentoCard>
        <DataTable columns={columns} rows={filtered} emptyMessage="Nenhum evento encontrado para esses filtros." />
      </BentoCard>
    </div>
  )
}
