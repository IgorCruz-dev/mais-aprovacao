import { SignIn } from "@clerk/nextjs"
import { sanitizeRedirectUrl } from "@mais-aprovacao/utils"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>
}) {
  const params = await searchParams
  // Anti open-redirect: só aceita caminho relativo; "/" cai no roteamento por role do middleware.
  const redirectUrl = sanitizeRedirectUrl(params.redirect_url) ?? "/"

  return (
    <main className="flex min-h-screen items-center justify-center px-4" style={{ background: "#F4F6FB" }}>
      <SignIn forceRedirectUrl={redirectUrl} signUpUrl="/sign-up" />
    </main>
  )
}
