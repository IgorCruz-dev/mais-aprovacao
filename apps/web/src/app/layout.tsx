import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Plus_Jakarta_Sans, Syne, Inter, Caveat } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"

// Display do painel do aluno — melhor abertura de contra-forma em bold que Syne
const generalSans = localFont({
  src: "../../public/fonts/GeneralSans-Variable.woff2",
  variable: "--font-general",
  weight: "200 700",
  display: "swap",
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  title: "+Aprovação — Cursinho Pré-Vestibular Online",
  description:
    "Videoaulas, simulados, correção de redação e aulões ao vivo.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="pt-BR"
        className={`${plusJakartaSans.variable} ${syne.variable} ${inter.variable} ${caveat.variable} ${generalSans.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  )
}
