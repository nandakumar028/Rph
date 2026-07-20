import type { Metadata } from 'next'
import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your CRM Portal account and start managing your sales pipeline today.',
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            CRM Portal
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        <Image
          src="/auth-bg.jpg"
          alt="Abstract blue wavy background"
          fill
          className="object-cover dark:brightness-[0.75]"
          priority
        />
        {/* overlay gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-2xl font-bold leading-snug drop-shadow">
            &ldquo;We closed $486K in new deals in our first month with CRM Portal.&rdquo;
          </p>
          <p className="mt-3 text-sm text-white/70">&mdash; Marcus Reyes, CRO at Globex Inc</p>
        </div>
      </div>
    </div>
  )
}
