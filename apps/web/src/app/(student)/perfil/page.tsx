"use client"

import { useState } from "react"
import { Check, ChevronRight, LogOut } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import { STUDENT } from "@/lib/mock-data"

type Tab = "identidade" | "plano"

const PLAN_FEATURES = [
  "Banco de questões ilimitado",
  "Simulados",
  "Videoaulas",
  "Redações (5/mês)",
  "Correção por IA",
  "Ranking mensal",
]

const SETTINGS = [
  { label: "Privacidade", type: "link" },
  { label: "Alterar senha", type: "link" },
  { label: "Termos de uso", type: "link" },
  { label: "Política de privacidade", type: "link" },
]

export default function PerfilPage() {
  const [tab, setTab] = useState<Tab>("identidade")
  const [notificationsOn, setNotificationsOn] = useState(true)

  return (
    <div className="max-w-[600px] mx-auto px-4 pt-6 pb-10">
      {/* Avatar + info */}
      <div className="flex flex-col items-center text-center mb-6">
        <div
          className="flex items-center justify-center rounded-full font-black text-[20px] mb-3"
          style={{ width: 72, height: 72, background: "#111", color: BRAND, border: `3px solid ${BRAND}` }}
        >
          {STUDENT.initial}
        </div>
        <h1 className="text-[20px] font-black text-[#111]" style={{ letterSpacing: "-0.5px" }}>
          {STUDENT.name}
        </h1>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-[700] mt-1.5 mb-1"
          style={{ background: "#EFF4FF", color: BRAND }}
        >
          ALUNO
        </span>
        <p className="text-[12px] text-[#AAAAAA]">{STUDENT.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["identidade", "plano"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 rounded-full py-2.5 text-[13px] font-[700] transition-colors"
            style={{
              background: tab === t ? BRAND : "#F5F5F5",
              color: tab === t ? "white" : "#888",
            }}
          >
            {t === "identidade" ? "Identidade" : "Meu Plano"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "identidade" && (
        <div className="rounded-[18px] border border-[#EBEBEB] bg-white divide-y divide-[#F0F0F0] overflow-hidden mb-5">
          {[
            { label: "Nome", value: STUDENT.name },
            { label: "Email", value: STUDENT.email },
            { label: "Status", value: "Aluno" },
            { label: "Membro desde", value: STUDENT.memberSince },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3.5 gap-4">
              <span className="text-[10px] font-[500] uppercase tracking-wide text-[#AAAAAA] flex-shrink-0">{row.label}</span>
              <span className="text-[14px] font-[600] text-[#111] text-right">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "plano" && (
        <div className="rounded-[18px] border border-[#EBEBEB] bg-white p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[16px] font-[800] text-[#111]">Plano Estudante</p>
            <span className="rounded-full px-2.5 py-1 text-[10px] font-[800]" style={{ background: "#ECFDF5", color: "#0F6E56" }}>
              Ativo
            </span>
          </div>
          <p className="text-[12px] text-[#888] mb-4">Próxima cobrança: 02/08/2026</p>
          <div className="flex flex-col gap-2.5 mb-4">
            {PLAN_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check size={14} style={{ color: "#0F6E56" }} className="flex-shrink-0" />
                <span className="text-[13px] text-[#111]">{feature}</span>
              </div>
            ))}
          </div>
          <button className="text-[13px] font-[700] transition-opacity hover:opacity-70" style={{ color: BRAND }}>
            Ver detalhes do plano
          </button>
        </div>
      )}

      {/* Settings */}
      <div className="mb-3">
        <p className="text-[14px] font-[800] text-[#111] mb-3">Configurações</p>
        <div className="rounded-[18px] border border-[#EBEBEB] bg-white divide-y divide-[#F0F0F0] overflow-hidden">
          {/* Notifications toggle */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[14px] font-[600] text-[#111]">Notificações</span>
            <button
              onClick={() => setNotificationsOn((v) => !v)}
              className="relative rounded-full transition-colors duration-200 flex-shrink-0"
              style={{ width: 44, height: 24, background: notificationsOn ? BRAND : "#DDDDDD" }}
            >
              <span
                className="absolute top-1 rounded-full bg-white transition-all duration-200"
                style={{ width: 16, height: 16, left: notificationsOn ? 24 : 4 }}
              />
            </button>
          </div>

          {SETTINGS.map((s) => (
            <button key={s.label} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F5F5F5] transition-colors">
              <span className="text-[14px] font-[600] text-[#111]">{s.label}</span>
              <ChevronRight size={16} className="text-[#AAAAAA]" />
            </button>
          ))}
        </div>
      </div>

      <button
        className="w-full flex items-center justify-center gap-2 py-3 text-[14px] font-[700] transition-opacity hover:opacity-70"
        style={{ color: "#D14000" }}
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </div>
  )
}
