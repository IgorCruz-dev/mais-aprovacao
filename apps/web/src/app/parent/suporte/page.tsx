"use client"

import { useState } from "react"
import { CaretDown, CaretRight, CaretUp, Envelope, Headset, Plus, WhatsappLogo } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  APROVA,
  BentoCard,
  PageHeader,
  PrimaryButton,
  RevealGroup,
  RevealItem,
  SectionTitle,
  showToast,
} from "@/components/student/StudentSurface"

type Channel = {
  icon: PhosphorIcon
  label: string
  desc: string
  cta: string
  color: string
  bg: string
}

const CHANNELS: Channel[] = [
  {
    icon: WhatsappLogo,
    label: "WhatsApp",
    desc: "Atendimento rápido via WhatsApp. Resposta em até 2h no horário comercial.",
    cta: "Abrir WhatsApp",
    color: "#25D366",
    bg: "#E9FBF0",
  },
  {
    icon: Envelope,
    label: "E-mail",
    desc: "Envie sua dúvida por email. Respondemos em até 24h úteis.",
    cta: "Enviar e-mail",
    color: APROVA.blue,
    bg: APROVA.blueSoft,
  },
  {
    icon: Headset,
    label: "Chat ao vivo",
    desc: "Fale com um atendente agora. Disponível de seg-sex das 8h às 18h.",
    cta: "Abrir chat",
    color: "#6C4BD9",
    bg: "#F0ECFF",
  },
]

const FAQ = [
  {
    question: "Como acompanho o progresso do meu filho na plataforma?",
    answer: 'Acesse a seção "Alunos" no menu lateral e clique em "Ver acompanhamento" no cartão do aluno. Você terá uma visão completa das atividades, desempenho por matéria, ofensiva de estudos e situação financeira.',
  },
  {
    question: "Como funciona o vínculo entre responsável e aluno?",
    answer: 'Acesse "Alunos" e informe o email do aluno cadastrado. A equipe do Mais Aprovação verificará o vínculo em até 24h úteis. Após a verificação, você terá acesso ao acompanhamento completo.',
  },
  {
    question: "Como altero o método de pagamento?",
    answer: 'Acesse "Financeiro" no menu lateral. No cartão do aluno, clique em "Detalhes" e você poderá atualizar o método de pagamento. Para PIX, o código é enviado por email.',
  },
  {
    question: "Posso acompanhar mais de um aluno?",
    answer: 'Sim! Você pode vincular múltiplos alunos à sua conta. Acesse "Alunos" e adicione quantos alunos desejar, desde que o vínculo seja verificado pela equipe.',
  },
  {
    question: "Como agendo uma reunião pedagógica?",
    answer: 'Acesse "Reuniões" no menu lateral e clique em "Solicitar reunião". Nossa equipe pedagógica entrará em contato em até 24h úteis para confirmar data e horário.',
  },
  {
    question: "O que fazer se o aluno não está acessando a plataforma?",
    answer: 'Acesse "Atividades" para ver a última interação do aluno. Em caso de inatividade prolongada, entre em contato pelo WhatsApp ou abra um chamado de suporte. Também recomendamos agendar uma reunião pedagógica.',
  },
]

const TICKETS = [
  { id: "t1", title: "Dúvida sobre mensalidade de agosto", status: "aberto", date: "08/07/2025" },
  { id: "t2", title: "Solicitação de atualização cadastral", status: "resolvido", date: "02/07/2025" },
]

export default function ParentSuportePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketDesc, setTicketDesc] = useState("")

  function handleTicket(e: React.FormEvent) {
    e.preventDefault()
    setTicketDesc("")
    setShowTicketForm(false)
    showToast("Chamado aberto! Responderemos em até 24h úteis.")
  }

  return (
    <RevealGroup className="mx-auto max-w-[1240px] px-4 pt-4 pb-10 lg:px-8 lg:pt-7">
      <RevealItem>
        <PageHeader
          kicker="Área do responsável"
          title="Suporte"
          subtitle="Canais de atendimento, perguntas frequentes e chamados."
        />
      </RevealItem>

      {/* Canais */}
      <RevealItem>
        <SectionTitle title="Fale conosco" kicker="Canais de atendimento" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon
            return (
              <BentoCard key={ch.label} className="flex flex-col gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: ch.bg }}>
                  <Icon size={24} weight="fill" color={ch.color} />
                </div>
                <div>
                  <p className="text-[14px] font-extrabold" style={{ color: APROVA.ink }}>{ch.label}</p>
                  <p className="mt-1 text-[12px] leading-relaxed" style={{ color: APROVA.inkMuted }}>{ch.desc}</p>
                </div>
                <button
                  onClick={() => showToast(`Abrindo ${ch.label}…`)}
                  className="mt-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-extrabold text-white transition-transform hover:scale-[1.02]"
                  style={{ background: ch.color }}
                >
                  {ch.cta} <CaretRight size={12} weight="bold" />
                </button>
              </BentoCard>
            )
          })}
        </div>
      </RevealItem>

      {/* Chamados */}
      <RevealItem className="mt-4">
        <BentoCard>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: APROVA.blue }}>Meus chamados</p>
              <h2 className="font-display text-[17px] font-bold" style={{ color: APROVA.ink }}>Solicitações abertas</h2>
            </div>
            <button
              onClick={() => setShowTicketForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-extrabold text-white transition-transform hover:scale-[1.02]"
              style={{ background: APROVA.blue }}
            >
              <Plus size={13} weight="bold" /> Abrir chamado
            </button>
          </div>

          {showTicketForm && (
            <form onSubmit={handleTicket} className="mb-4 flex flex-col gap-3 rounded-2xl p-4" style={{ background: APROVA.surface }}>
              <p className="text-[13px] font-bold" style={{ color: APROVA.ink }}>Descreva sua solicitação</p>
              <textarea
                required
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                rows={3}
                placeholder="Informe sua dúvida ou solicitação com o máximo de detalhes possível…"
                className="w-full resize-none rounded-xl border px-4 py-2.5 text-[13px] outline-none focus:border-[#1B4DE4]"
                style={{ borderColor: "#E2E6F0", color: APROVA.ink }}
              />
              <div className="flex gap-2">
                <PrimaryButton className="text-[13px]">Enviar chamado</PrimaryButton>
                <button
                  type="button"
                  onClick={() => setShowTicketForm(false)}
                  className="rounded-full px-4 py-2 text-[13px] font-bold"
                  style={{ background: "#EEF1F7", color: APROVA.inkMuted }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {TICKETS.map((ticket, i) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between py-3"
              style={{ borderTop: i === 0 ? "1px solid #F1F3F8" : undefined, borderBottom: "1px solid #F1F3F8" }}
            >
              <div>
                <p className="text-[13px] font-semibold" style={{ color: APROVA.ink }}>{ticket.title}</p>
                <p className="text-[11.5px]" style={{ color: APROVA.inkMuted }}>Aberto em {ticket.date}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{
                  background: ticket.status === "aberto" ? APROVA.blueSoft : "#E6F8F0",
                  color: ticket.status === "aberto" ? APROVA.blue : APROVA.successDeep,
                }}
              >
                {ticket.status === "aberto" ? "Em aberto" : "Resolvido"}
              </span>
            </div>
          ))}
        </BentoCard>
      </RevealItem>

      {/* FAQ */}
      <RevealItem className="mt-4">
        <SectionTitle title="Perguntas frequentes" kicker="FAQ" />
        <BentoCard className="p-0 overflow-hidden">
          {FAQ.map((item, i) => {
            const isOpen = openFaq === i
            return (
              <div key={i} style={{ borderTop: i > 0 ? "1px solid #F1F3F8" : undefined }}>
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#FAFBFD]"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                >
                  <span className="pr-4 text-[13.5px] font-semibold" style={{ color: APROVA.ink }}>
                    {item.question}
                  </span>
                  {isOpen ? (
                    <CaretUp size={16} weight="bold" color={APROVA.blue} className="shrink-0" />
                  ) : (
                    <CaretDown size={16} weight="bold" color={APROVA.inkMuted} className="shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-[12.5px] leading-relaxed" style={{ color: APROVA.inkMuted }}>
                    {item.answer}
                  </p>
                )}
              </div>
            )
          })}
        </BentoCard>
      </RevealItem>
    </RevealGroup>
  )
}
