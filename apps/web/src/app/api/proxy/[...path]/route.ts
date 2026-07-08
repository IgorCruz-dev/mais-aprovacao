import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const { getToken } = await auth()
  const token = await getToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const target = new URL(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/${path.join("/")}`)
  target.search = req.nextUrl.search

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  }
  const contentType = req.headers.get("content-type")
  if (contentType) headers["Content-Type"] = contentType

  const res = await fetch(target, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
    cache: "no-store",
  })

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  })
}

export const GET = proxy
export const POST = proxy
export const PATCH = proxy
