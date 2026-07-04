"use client"

import { useState } from "react"
import { X } from "lucide-react"

type AnnouncementBarProps = {
  text: string
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="relative flex items-center justify-center bg-[#F5C518] px-10 py-2.5">
      <p className="text-sm font-medium text-[#03050D]">{text}</p>
      <button
        onClick={() => setVisible(false)}
        aria-label="Fechar aviso"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#03050D] opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  )
}
