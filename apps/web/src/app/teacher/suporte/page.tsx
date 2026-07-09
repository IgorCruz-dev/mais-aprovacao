"use client"

import { useState } from "react"
import { CaretDown, CaretUp, Plus, WhatsappLogo, Envelope, ChatCircle, WarningCircle, CheckCircle } from "@phosphor-icons/react"
import {
  APROVA, BentoCard, PageHeader, SectionTitle,
  RevealGroup, RevealItem, showToast,
} from "@/components/teacher/TeacherSurface"

const FAQ = [
  {
    q: "Como publicar uma nova aula na plataforma?",
    a: "Acesse 'Aulas' na barra lateral e clique em 'Planejar aula'. Preencha os dados da aula, selecione a turma e o material, e salve. A aula ficará com status 'Planejada' até ser transmitida ao vivo.",
  },
  {
    q: "Como acessar as redações dos alunos para corrigir?",
    a: "Vá até 'Correções' no menu lateral. Lá aparece a fila de redações pendentes, organizadas por prioridade e SLA. Clique em 'Corrigir' para abrir a redação e inserir as notas por competência.",
  },
  {
    q: "Como criar e agendar um simulado?",
    a: "Em 'Simulados', clique no botão 'Novo simulado' (em breve). Você poderá selecionar o banco de questões, definir data, duração e as turmas participantes.",
  },
  {
    q: "Como enviar um comunicado para minha turma?",
    a: "Acesse 'Comunicados' e clique em 'Novo comunicado'. Selecione a turma destinatária, a categoria (aula, simulado, etc.) e escreva o conteúdo. O aviso será entregue no painel dos alunos.",
  },
  {
    q: "Como exportar o relatório de desempenho?",
    a: "Na tela de Desempenho, você pode filtrar por turma e período. O botão de exportação PDF estará disponível na próxima versão. Por ora, use Print/PDF do navegador.",
  },
  {
    q: "O que fazer quando um aluno está sem atividade?",
    a: "No painel de Alunos, filtre por status 'Risco' para ver os alunos com baixa atividade. Clique no perfil do aluno para acessar o histórico e adicionar uma observação pedagógica. A coordenação também recebe alertas automáticos.",
  },
]

const TICKETS = [
  { id: "tkt-01", title: "Dificuldade para acessar redações da turma ENEM", status: "aberto", date: "03/07/2026", category: "Suporte técnico" },
  { id: "tkt-02", title: "Solicitação de banco de questões UFU 2024", status: "em_andamento", date: "01/07/2026", category: "Conteúdo pedagógico" },
]

const TICKET_STATUS_MAP = {
  aberto:        { label: "Aberto",        bg: APROVA.blueSoft, color: APROVA.blue },
  em_andamento:  { label: "Em andamento",  bg: "#FFF3DA",       color: "#B45309" },
  resolvido:     { label: "Resolvido",     bg: "#E6F8F0",       color: APROVA.successDeep },
}

export default function SuportePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [desc, setDesc] = useState("")

  function handleSubmit() {
    showToast("Chamado enviado! Retorno em até 24h.")
    setShowForm(false)
    setDesc("")
  }

  return (
    <RevealGroup className="mx-auto max-w-[900px] px-4 pt-4 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader kicker="Ajuda" title="Suporte" subtitle="Canais de atendimento e base de conhecimento" />
      </RevealItem>

      {/* Canais de contato */}
      <RevealItem className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { Icon: WhatsappLogo, color: "#25D366", bg: "#E8FBF0", label: "WhatsApp Coordenação", desc: "(64) 9 9999-0001", action: "Abrir chat" },
            { Icon: Envelope, color: APROVA.blue, bg: APROVA.blueSoft, label: "E-mail pedagógico", desc: "pedagogico@mais-aprovacao.com.br", action: "Enviar e-mail" },
            { Icon: ChatCircle, color: "#6C4BD9", bg: "#F0ECFF", label: "Chat interno", desc: "Resposta em ~2h úteis", action: "Iniciar chat" },
          ].map(({ Icon, color, bg, label, desc, action }) => (
            <button
              key={label}
              onClick={() => showToast(`${action} — em desenvolvimento`)}
              className="flex flex-col gap-3 rounded-2xl p-4 text-left transition-all hover:scale-[1.01]"
              style={{ background: bg, border: `1px solid ${color}30` }}
            >
              <Icon size={22} weight="fill" color={color} />
              <div>
                <p className="font-bold text-[13.5px]" style={{ color: APROVA.ink }}>{label}</p>
                <p className="text-[11.5px]" style={{ color: APROVA.inkMuted }}>{desc}</p>
              </div>
              <span className="text-[12px] font-extrabold" style={{ color }}>{action} →</span>
            </button>
          ))}
        </div>
      </RevealItem>

      {/* Chamados abertos */}
      <RevealItem className="mb-5">
        <BentoCard>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle title="Meus chamados" kicker="Suporte" />
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-extrabold text-white"
              style={{ background: APROVA.blue }}
            >
              <Plus size={13} weight="bold" /> Abrir chamado
            </button>
          </div>

          {showForm && (
            <div className="mb-4 rounded-2xl p-4" style={{ background: "#F6F7FB", border: "1px solid #EEF1F7" }}>
              <p className="mb-2 text-[12.5px] font-bold" style={{ color: APROVA.ink }}>Descreva o problema</p>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                placeholder="Descreva sua dúvida ou problema..."
                className="w-full rounded-xl p-3 text-[13px] outline-none resize-none"
                style={{ border: "1px solid #DDE1EC", color: APROVA.ink }}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="rounded-xl px-4 py-2 text-[12.5px] font-extrabold text-white"
                  style={{ background: APROVA.blue }}
                >
                  Enviar
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl px-4 py-2 text-[12.5px] font-extrabold"
                  style={{ background: "#EEF1F7", color: APROVA.inkMuted }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {TICKETS.map((t) => {
              const s = TICKET_STATUS_MAP[t.status as keyof typeof TICKET_STATUS_MAP]
              return (
                <div key={t.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: "#F6F7FB" }}>
                  {t.status === "resolvido"
                    ? <CheckCircle size={18} weight="fill" color={APROVA.success} />
                    : <WarningCircle size={18} weight="fill" color={t.status === "aberto" ? APROVA.blue : "#F59E0B"} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold" style={{ color: APROVA.ink }}>{t.title}</p>
                    <p className="text-[10.5px]" style={{ color: APROVA.inkMuted }}>{t.category} · {t.date}</p>
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
              )
            })}
          </div>
        </BentoCard>
      </RevealItem>

      {/* FAQ */}
      <RevealItem>
        <BentoCard>
          <SectionTitle title="Perguntas frequentes" kicker="FAQ" />
          <div className="flex flex-col">
            {FAQ.map((item, i) => (
              <div key={i} style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left"
                >
                  <p className="text-[13px] font-bold" style={{ color: APROVA.ink }}>{item.q}</p>
                  {openFaq === i
                    ? <CaretUp size={16} weight="bold" color={APROVA.blue} className="shrink-0" />
                    : <CaretDown size={16} weight="bold" color={APROVA.inkMuted} className="shrink-0" />}
                </button>
                {openFaq === i && (
                  <p className="pb-3 text-[12.5px] leading-relaxed" style={{ color: APROVA.inkMuted }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
