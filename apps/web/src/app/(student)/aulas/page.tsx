"use client"

import { useState } from "react"
import { Video, Play, Check, X } from "lucide-react"
import { BRAND } from "@/components/navigation/StudentChrome"
import { PageTitle, DarkHeroCard, ConcentricDecoration, AnimatedProgressBar, StatusBadge, StripeCard, showToast } from "@/components/student/StudentSurface"
import { CURRENT_LESSON, LESSONS, type Lesson } from "@/lib/mock-data"

const SUBJECTS = ["Todas", "Biologia", "Matemática", "Língua Portuguesa", "História"]

function LessonPlayer({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const [completed, setCompleted] = useState(lesson.status === "Concluída")
  const [tab, setTab] = useState<"info" | "notes">("info")

  const handleComplete = () => {
    setCompleted(true)
    showToast("Aula concluída!", "✓")
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[22px] w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video placeholder */}
        <div className="aspect-video bg-[#111] flex items-center justify-center relative">
          <button className="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors" style={{ width: 60, height: 60 }}>
            <Play size={28} fill="white" className="text-white ml-1" />
          </button>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-[16px] font-black text-[#111] mb-1">{lesson.title}</h3>
          <p className="text-[12px] text-[#888] mb-3">{lesson.courseTitle} · Aula {lesson.lessonNumber} · {lesson.duration}</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(["info", "notes"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="rounded-full px-3 py-1 text-[12px] font-[700] transition-colors"
                style={{ background: tab === t ? BRAND : "#F5F5F5", color: tab === t ? "white" : "#888" }}
              >
                {t === "info" ? "Info" : "Anotações"}
              </button>
            ))}
          </div>

          {tab === "notes" && (
            <textarea
              className="w-full rounded-[12px] border border-[#EBEBEB] p-3 text-[13px] resize-none outline-none focus:border-[#2563EB] transition-colors"
              rows={4}
              placeholder="Faça suas anotações aqui..."
            />
          )}

          {/* Navigation */}
          <div className="flex gap-2 mt-3">
            <button className="flex-1 rounded-full py-2 text-[12px] font-[700] border border-[#EBEBEB] text-[#888] hover:bg-[#F5F5F5] transition-colors">
              ← Aula anterior
            </button>
            <button className="flex-1 rounded-full py-2 text-[12px] font-[700] border border-[#EBEBEB] text-[#888] hover:bg-[#F5F5F5] transition-colors">
              Próxima aula →
            </button>
          </div>

          {!completed && (
            <button
              onClick={handleComplete}
              className="w-full rounded-full py-2.5 mt-2 text-[13px] font-[800] text-white transition-opacity hover:opacity-90"
              style={{ background: "#0F6E56" }}
            >
              ✓ Marcar como concluída
            </button>
          )}
          {completed && (
            <div className="flex items-center justify-center gap-2 mt-2 py-2 rounded-full bg-[#ECFDF5]">
              <Check size={14} style={{ color: "#0F6E56" }} />
              <span className="text-[13px] font-[800] text-[#0F6E56]">Aula concluída</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LessonCard({ lesson, onClick }: { lesson: Lesson; onClick: () => void }) {
  return (
    <StripeCard color={lesson.color} onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] text-[#AAAAAA]">Aula {lesson.lessonNumber}</span>
            <StatusBadge status={lesson.status} />
          </div>
          <p className="text-[13px] font-[800] text-[#111] leading-snug">{lesson.title}</p>
          <p className="text-[11px] text-[#888] mt-0.5">{lesson.professor} · {lesson.duration}</p>
          {lesson.status === "Em andamento" && lesson.progress !== undefined && (
            <div className="mt-2">
              <AnimatedProgressBar pct={lesson.progress} color={lesson.color} height={3} />
            </div>
          )}
        </div>
        {lesson.status === "Concluída" && (
          <Check size={18} style={{ color: "#0F6E56" }} className="flex-shrink-0" />
        )}
        {lesson.status === "Em andamento" && (
          <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: lesson.color }}>
            <Play size={14} fill="white" className="text-white ml-0.5" />
          </div>
        )}
      </div>
    </StripeCard>
  )
}

export default function AulasPage() {
  const [activeSubject, setActiveSubject] = useState("Todas")
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  const courses = Array.from(new Set(LESSONS.map((l) => l.courseTitle)))
  const filtered = activeSubject === "Todas"
    ? LESSONS
    : LESSONS.filter((l) => l.subject === activeSubject)

  const filteredCourses = Array.from(new Set(filtered.map((l) => l.courseTitle)))

  return (
    <div className="max-w-[760px] mx-auto px-4 pt-5 pb-8">
      <PageTitle title="Aulas" subtitle="Acelere seu aprendizado com videoaulas." />

      {/* Hero continue card */}
      <div className="mt-5 mb-5">
        <DarkHeroCard watermark={String(CURRENT_LESSON.progress)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full px-2.5 py-1 text-[9px] font-[800] uppercase tracking-wide" style={{ background: "rgba(37,99,235,0.18)", color: "#93B8F8" }}>
              Continue de onde parou
            </span>
            <span className="flex items-center gap-1 text-[10px] font-[700]" style={{ color: "#93B8F8" }}>
              <Video size={11} /> VIDEOAULA
            </span>
          </div>
          <h2 className="text-[20px] font-black text-white leading-tight mb-1">{CURRENT_LESSON.title}</h2>
          <p className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
            Aula {CURRENT_LESSON.lesson} de {CURRENT_LESSON.totalLessons} · {CURRENT_LESSON.professor} · {CURRENT_LESSON.progress}% assistido
          </p>
          <div className="mb-3 w-full rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,0.08)" }}>
            <AnimatedProgressBar pct={CURRENT_LESSON.progress} color={BRAND} height={8} background="transparent" />
          </div>
          <button
            onClick={() => setSelectedLesson(LESSONS[2])}
            className="flex items-center justify-center gap-2 w-full rounded-full py-3 text-[14px] font-black text-white transition-opacity hover:opacity-90"
            style={{ background: BRAND }}
          >
            <Play size={14} fill="white" /> Continuar assistindo
          </button>
        </DarkHeroCard>
      </div>

      {/* Subject chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5 pb-0.5">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-[700] transition-colors"
            style={{ background: activeSubject === s ? BRAND : "#F5F5F5", color: activeSubject === s ? "white" : "#888" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Course groups */}
      <div className="flex flex-col gap-6">
        {filteredCourses.map((courseTitle) => {
          const courseLessons = filtered.filter((l) => l.courseTitle === courseTitle)
          const first = courseLessons[0]
          return (
            <div key={courseTitle}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[14px] font-[800] text-[#111]">{courseTitle}</p>
                <p className="text-[11px] text-[#888]">{first.professor} · {courseLessons.length} aulas</p>
              </div>
              <div className="flex flex-col gap-2">
                {courseLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} onClick={() => setSelectedLesson(lesson)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedLesson && (
        <LessonPlayer lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
      )}
    </div>
  )
}
