"use client"

import type { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { formatScientificText } from "./scientific-text"

export function QuestionRichText({ text, className = "" }: { text?: string | null; className?: string }) {
  const components = {
    p: ({ children }: { children?: ReactNode }) => <p className="my-3 leading-relaxed">{children}</p>,
    li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{children}</li>,
    ul: ({ children }: { children?: ReactNode }) => <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }: { children?: ReactNode }) => <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>,
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src || ""} alt={alt || "Imagem da questão"} className="my-4 max-h-[28rem] w-auto max-w-full rounded-lg border object-contain" loading="lazy" />
    ),
  } as unknown as Components

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
        {formatScientificText(String(text ?? ""))}
      </ReactMarkdown>
    </div>
  )
}
