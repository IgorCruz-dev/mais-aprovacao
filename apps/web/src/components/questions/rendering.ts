export const questionMarkdownImageRegex = /!\[[^\]]*]\((.*?)\)/g

export function normalizeQuestionImageUrl(raw: string): string | null {
  const cleaned = String(raw || "").trim().replace(/^<|>$/g, "").replace(/^['"]|['"]$/g, "")
  if (!cleaned) return null
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned
  if (cleaned.startsWith("/storage/v1/object/public/")) return cleaned
  return null
}

export function extractMarkdownImageUrls(text?: string | null): string[] {
  if (!text) return []
  return Array.from(text.matchAll(questionMarkdownImageRegex))
    .map((match) => normalizeQuestionImageUrl(match[1] || ""))
    .filter((url): url is string => Boolean(url))
}

export function stripMarkdownImages(text?: string | null): string {
  return String(text || "").replace(questionMarkdownImageRegex, "").trim()
}

export function extractImageUrls(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map((item) => normalizeQuestionImageUrl(String(item))).filter((url): url is string => Boolean(url))
  if (typeof value !== "string") return []
  const markdown = extractMarkdownImageUrls(value)
  if (markdown.length) return markdown
  const direct = normalizeQuestionImageUrl(value)
  return direct ? [direct] : []
}
