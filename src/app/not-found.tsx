import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <FileQuestion className="size-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
      <p className="text-muted-foreground mt-2 mb-6 max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
        Return Home
      </Link>
    </div>
  )
}
