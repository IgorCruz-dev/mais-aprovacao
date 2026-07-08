export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#F4F6FB" }}>
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
        style={{ borderColor: "#1B4DE4 transparent #1B4DE4 #1B4DE4" }}
      />
    </div>
  )
}
