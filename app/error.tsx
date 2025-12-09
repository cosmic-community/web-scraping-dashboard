'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Quelque chose s'est mal passé!</h2>
        <p className="text-gray-400 mb-6">{error.message}</p>
        <button onClick={reset} className="btn-primary">
          Réessayer
        </button>
      </div>
    </div>
  )
}